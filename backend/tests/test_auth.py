import pytest
from app.core.security import get_password_hash, verify_password, create_access_token, decode_token

@pytest.mark.asyncio
async def test_password_hashing():
    pwd = "superSecretPassword123"
    hashed = get_password_hash(pwd)
    assert hashed != pwd
    assert verify_password(pwd, hashed) is True
    assert verify_password("wrongPassword", hashed) is False

@pytest.mark.asyncio
async def test_jwt_token():
    user_id = "test-user-id-456"
    token = create_access_token(user_id)
    payload = decode_token(token)
    assert payload is not None
    assert payload["sub"] == user_id

@pytest.mark.asyncio
async def test_login_endpoint(client):
    res = await client.post("/api/auth/login", json={
        "email": "student@careerintell.com",
        "password": "student123"
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "student@careerintell.com"

@pytest.mark.asyncio
async def test_invalid_login(client):
    res = await client.post("/api/auth/login", json={
        "email": "student@careerintell.com",
        "password": "wrongpassword"
    })
    assert res.status_code == 401
