import os
from typing import Dict, Any, List

try:
    import pymupdf as fitz
except ImportError:
    try:
        import fitz
    except ImportError:
        fitz = None

try:
    import pdfplumber
except ImportError:
    pdfplumber = None

try:
    from app.nlp.text_processor import clean_text, segment_sections, parse_skill_subcategories, extract_resume_entities
except ImportError:
    from backend.app.nlp.text_processor import clean_text, segment_sections, parse_skill_subcategories, extract_resume_entities

# Lazy RapidOCR singleton for scanned/image PDFs
_ocr_engine = None

def get_ocr_engine():
    global _ocr_engine
    if _ocr_engine is None:
        try:
            from rapidocr_onnxruntime import RapidOCR
            _ocr_engine = RapidOCR()
        except Exception as e:
            print(f"RapidOCR initialization notice: {e}")
            _ocr_engine = False
    return _ocr_engine

def extract_text_from_pdf(file_path: str) -> Dict[str, Any]:
    """
    Bulletproof PDF text and metadata extraction using PyMuPDF (layout-sorted blocks & dehyphenated),
    with pdfplumber secondary fallback and RapidOCR tertiary fallback for scanned/image PDFs.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    raw_text = ""
    page_count = 0
    used_ocr = False

    # Primary extractor: PyMuPDF with layout-aware block sorting and dehyphenation
    if fitz is not None:
        try:
            doc = fitz.open(file_path)
            page_count = len(doc)
            all_blocks_text: List[str] = []

            # Flags to dehyphenate broken words across linebreaks and preserve ligatures
            text_flags = 0
            if hasattr(fitz, "TEXT_DEHYPHENATE"):
                text_flags |= fitz.TEXT_DEHYPHENATE
            if hasattr(fitz, "TEXT_PRESERVE_LIGATURES"):
                text_flags |= fitz.TEXT_PRESERVE_LIGATURES
            if hasattr(fitz, "TEXT_PRESERVE_WHITESPACE"):
                text_flags |= fitz.TEXT_PRESERVE_WHITESPACE

            for page_idx, page in enumerate(doc):
                try:
                    # Sort blocks geometrically so multi-column layouts maintain cohesive reading flow
                    blocks = page.get_text("blocks", sort=True, flags=text_flags)
                    page_text_pieces = []
                    for b in blocks:
                        # block tuple: (x0, y0, x1, y1, text, block_no, block_type)
                        if len(b) >= 7:
                            if b[6] == 0:  # 0 is regular text block
                                block_content = b[4].strip()
                                if block_content:
                                    page_text_pieces.append(block_content)
                        elif len(b) >= 5:
                            block_content = str(b[4]).strip()
                            if block_content:
                                page_text_pieces.append(block_content)

                    if page_text_pieces:
                        all_blocks_text.append("\n\n".join(page_text_pieces))
                    else:
                        # Fallback to plain get_text if blocks produced empty output
                        plain = page.get_text("text", flags=text_flags)
                        if plain.strip():
                            all_blocks_text.append(plain.strip())
                except Exception as page_err:
                    print(f"Warning on page {page_idx} during PyMuPDF block extraction: {page_err}")
                    # Attempt simple fallback for this single page
                    try:
                        all_blocks_text.append(page.get_text())
                    except Exception:
                        pass

            doc.close()
            raw_text = "\n\n".join(all_blocks_text)
        except Exception as e:
            print(f"PyMuPDF failed: {e}, attempting pdfplumber fallback...")

    # Secondary extractor: pdfplumber (for complex vector tables or when PyMuPDF got insufficient tokens)
    if (not raw_text.strip() or len(raw_text.strip().split()) < 25) and pdfplumber is not None:
        try:
            with pdfplumber.open(file_path) as pdf:
                page_count = len(pdf.pages)
                pages_text = []
                for p in pdf.pages:
                    text = p.extract_text(layout=True) or p.extract_text()
                    if text:
                        pages_text.append(text)
                if pages_text:
                    fallback_text = "\n\n".join(pages_text)
                    if len(fallback_text.strip().split()) > len(raw_text.strip().split()):
                        raw_text = fallback_text
        except Exception as e:
            print(f"pdfplumber fallback notice: {e}")

    # Tertiary Fallback: Scanned / Image PDF via RapidOCR
    if len(raw_text.strip().split()) < 25 and fitz is not None:
        ocr_engine = get_ocr_engine()
        if ocr_engine:
            try:
                doc = fitz.open(file_path)
                ocr_pages = []
                for page in doc:
                    pix = page.get_pixmap(dpi=150)
                    img_bytes = pix.tobytes("png")
                    result, _ = ocr_engine(img_bytes)
                    if result:
                        page_ocr_text = "\n".join([line[1] for line in result])
                        ocr_pages.append(page_ocr_text)
                doc.close()

                ocr_full_text = "\n\n".join(ocr_pages)
                if len(ocr_full_text.strip().split()) > len(raw_text.strip().split()):
                    raw_text = ocr_full_text
                    used_ocr = True
            except Exception as e:
                print(f"RapidOCR page extraction notice: {e}")

    # Process and segment text
    cleaned = clean_text(raw_text)
    sections = segment_sections(cleaned)
    word_count = len(cleaned.split()) if cleaned else 0

    # Sub-category parsing inside the detected skills section
    skills_subcategories = {}
    if "skills" in sections:
        skills_subcategories = parse_skill_subcategories(sections["skills"])

    # Extract high-level entities (contact, degrees, GPA)
    entities = extract_resume_entities(cleaned)

    return {
        "raw_text": raw_text,
        "clean_text": cleaned,
        "page_count": page_count,
        "word_count": word_count,
        "sections": sections,
        "subcategories": skills_subcategories,
        "entities": entities,
        "used_ocr": used_ocr
    }
