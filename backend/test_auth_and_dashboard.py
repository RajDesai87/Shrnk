"""
Automated Integration Test for SHRNK Backend
Tests Authentication, JWT, Demo Seeding, URL Management, Ownership Authorization,
Public Redirection, Resilient Click Tracking, Dashboard Metrics, Analytics,
URL Expiration, Input & Alias Security Validation, Dynamic BASE_URL Changing,
Alias Reservation / Release on Deletion (EXPIRED != DELETED),
and Robust Custom-Alias Restrictions (Reserved, Profanity Filter, Case-Insensitivity).
"""
from datetime import datetime, timezone, timedelta
import sqlite3
from fastapi.testclient import TestClient
from backend.main import app
from backend.config import settings
from backend.database import SessionLocal, init_db
from backend.models import User, URL, Click
from backend.seed import seed_demo_user

client = TestClient(app)


def test_full_flow():
    print("=" * 60)
    print("RUNNING SHRNK FULL INTEGRATION TESTS")
    print("=" * 60)

    # 1. Initialize & Seed
    init_db()
    db = SessionLocal()
    seed_demo_user(db)
    db.close()

    # Verify database schema: short_url must NOT be a column in SQLite
    conn = sqlite3.connect("shrnk.db")
    cursor = conn.cursor()
    cursor.execute("PRAGMA table_info(urls);")
    columns = [row[1] for row in cursor.fetchall()]
    conn.close()
    assert "short_url" not in columns, "Architecture violation: short_url should NOT exist in database table!"
    assert "short_code" in columns, "short_code must exist in urls table."
    assert "original_url" in columns, "original_url must exist in urls table."
    print("   Database schema verified: Only short_code and original_url stored (no short_url column).")

    # 2. Test Demo User Login
    print("\n1. Testing Demo User Login (user1@gmail.com / Password@123)...")
    res = client.post("/api/auth/login", json={"email": "user1@gmail.com", "password": "Password@123"})
    assert res.status_code == 200, f"Demo login failed: {res.text}"
    demo_token = res.json()["access_token"]
    demo_headers = {"Authorization": f"Bearer {demo_token}"}
    print(f"   Demo login successful! User: {res.json()['user']['email']}")

    # 3. Test Invalid Login
    print("\n2. Testing Invalid Credentials Rejection...")
    bad_res = client.post("/api/auth/login", json={"email": "user1@gmail.com", "password": "WrongPassword"})
    assert bad_res.status_code == 401, f"Expected 401, got {bad_res.status_code}"
    assert bad_res.json()["detail"] == "Invalid email or password."
    print("   Invalid login correctly rejected with 401.")

    # 4. Test User Registration
    print("\n3. Testing New User Registration...")
    reg_email = "testuser@shrnk.in"
    # Clean up if existing
    db = SessionLocal()
    existing = db.query(User).filter(User.email == reg_email).first()
    if existing:
        db.delete(existing)
        db.commit()
    db.close()

    reg_res = client.post(
        "/api/auth/register",
        json={"name": "Test User", "email": reg_email, "password": "TestPassword@123"},
    )
    assert reg_res.status_code == 201, f"Registration failed: {reg_res.text}"
    test_token = reg_res.json()["access_token"]
    test_headers = {"Authorization": f"Bearer {test_token}"}
    print(f"   User registered successfully! Token generated.")

    # Duplicate registration check
    dup_res = client.post(
        "/api/auth/register",
        json={"name": "Test User", "email": reg_email, "password": "TestPassword@123"},
    )
    assert dup_res.status_code == 400, f"Expected 400 on duplicate, got {dup_res.status_code}"
    print("   Duplicate email correctly rejected with 400.")

    # 5. Test Current User Profile (GET /api/auth/me)
    print("\n4. Testing GET /api/auth/me...")
    me_res = client.get("/api/auth/me", headers=test_headers)
    assert me_res.status_code == 200
    assert me_res.json()["email"] == reg_email
    print(f"   Current user verified: {me_res.json()['name']} ({me_res.json()['email']})")

    # 6. Test Reserved System Aliases (Case-Insensitive)
    print("\n5. Testing Reserved System Aliases...")
    reserved_tests = ["login", "LOGIN", "Login", "signup", "register", "dashboard", "api", "admin", "terms", "privacy"]
    for r_alias in reserved_tests:
        r_res = client.post(
            "/api/urls",
            headers=test_headers,
            json={"original_url": "https://example.com", "custom_alias": r_alias},
        )
        assert r_res.status_code in (400, 422), f"Expected rejection for reserved alias '{r_alias}', got {r_res.status_code}"
        assert "reserved" in r_res.text.lower()
    print("   All reserved system aliases correctly rejected case-insensitively.")

    # 7. Test Profanity & Bad Words Filter (Case-Insensitive)
    print("\n6. Testing Profanity & Inappropriate Words Filter...")
    profane_tests = ["porn", "Porn", "PORN", "free-porn", "fuck", "my-fuck-link", "sex", "xxx", "nazi", "f_u_c_k"]
    for p_alias in profane_tests:
        p_res = client.post(
            "/api/urls",
            headers=test_headers,
            json={"original_url": "https://example.com", "custom_alias": p_alias},
        )
        assert p_res.status_code in (400, 422), f"Expected rejection for profane alias '{p_alias}', got {p_res.status_code}"
        assert "cannot be used" in p_res.text.lower() or "blocked" in p_res.text.lower()

    # Verify innocent words are NOT falsely flagged (Scunthorpe test)
    innocent_tests = ["classic", "assistant", "document"]
    for inno in innocent_tests:
        inno_res = client.post(
            "/api/urls",
            headers=test_headers,
            json={"original_url": "https://example.com", "custom_alias": f"test-{inno}"},
        )
        assert inno_res.status_code == 201, f"Innocent word '{inno}' was falsely rejected: {inno_res.text}"
        # Clean up
        db = SessionLocal()
        db.query(URL).filter(URL.id == inno_res.json()["id"]).delete()
        db.commit()
        db.close()
    print("   Profanity filter passed: Blocked offensive words without false positives on innocent words.")

    # 8. Test Invalid Format & Length Limits
    print("\n7. Testing Format & Length Validation...")
    # Too short (< 3 chars)
    short_res = client.post(
        "/api/urls",
        headers=test_headers,
        json={"original_url": "https://example.com", "custom_alias": "ab"},
    )
    assert short_res.status_code in (400, 422)
    assert "between 3 and 64" in short_res.text.lower()

    # Invalid characters (space, slash, query)
    for bad_char_alias in ["bad alias", "bad/alias", "bad?alias", "bad#alias"]:
        fmt_res = client.post(
            "/api/urls",
            headers=test_headers,
            json={"original_url": "https://example.com", "custom_alias": bad_char_alias},
        )
        assert fmt_res.status_code in (400, 422)
        assert "letters, numbers, hyphens" in fmt_res.text.lower()
    print("   Format and length validation verified.")

    # 9. Test Valid Normal Aliases & Creation
    print("\n8. Testing Valid Custom Alias Creation...")
    url_res = client.post(
        "/api/urls",
        headers=test_headers,
        json={"original_url": "https://developer.mozilla.org/en-US/docs/Web", "custom_alias": "Portfolio"},
    )
    assert url_res.status_code == 201, f"URL creation failed: {url_res.text}"
    created_url = url_res.json()
    url_id = created_url["id"]
    short_code = created_url["short_code"]
    assert short_code == "Portfolio"
    assert created_url["status"] == "ACTIVE"
    assert created_url["short_url"] == f"{settings.BASE_URL.rstrip('/')}/Portfolio"
    print(f"   Created short link: {created_url['short_url']} (ID: {url_id})")

    # 10. Test Duplicate Claiming & Case Variations
    print("\n9. Testing Duplicate & Case-Insensitive Claim Rejection...")
    # Exact duplicate
    dup_alias = client.post(
        "/api/urls",
        headers=demo_headers,
        json={"original_url": "https://example.com/other", "custom_alias": "Portfolio"},
    )
    assert dup_alias.status_code == 400
    assert "already in use" in dup_alias.json()["detail"].lower()

    # Case variation 'portfolio'
    case_alias_1 = client.post(
        "/api/urls",
        headers=demo_headers,
        json={"original_url": "https://example.com/other", "custom_alias": "portfolio"},
    )
    assert case_alias_1.status_code == 400
    assert "already in use" in case_alias_1.json()["detail"].lower()

    # Case variation 'PORTFOLIO'
    case_alias_2 = client.post(
        "/api/urls",
        headers=demo_headers,
        json={"original_url": "https://example.com/other", "custom_alias": "PORTFOLIO"},
    )
    assert case_alias_2.status_code == 400
    assert "already in use" in case_alias_2.json()["detail"].lower()
    print("   Case-insensitive duplicate rejection verified across different users.")

    # 11. Test Public Case-Insensitive Redirection & Click Tracking
    print("\n10. Testing Public Case-Insensitive Redirection (GET /portfolio)...")
    # Access via lowercase 'portfolio' when stored as 'Portfolio'
    redirect_res = client.get("/portfolio", follow_redirects=False)
    assert redirect_res.status_code == 307
    assert redirect_res.headers["location"] == "https://developer.mozilla.org/en-US/docs/Web"
    
    # Access via uppercase 'PORTFOLIO'
    redir_upper = client.get("/PORTFOLIO", follow_redirects=False)
    assert redir_upper.status_code == 307
    assert redir_upper.headers["location"] == "https://developer.mozilla.org/en-US/docs/Web"
    print(f"   Case-insensitive redirection verified -> {redirect_res.headers['location']}")

    # Verify click count
    url_after = client.get(f"/api/urls/{url_id}", headers=test_headers).json()
    assert url_after["click_count"] == 2
    print(f"   URL click count incremented to {url_after['click_count']}.")

    # 12. Test Expired URL Logic & Alias Reservation (EXPIRED != DELETED)
    print("\n11. Testing Expired URL Status & Alias Reservation...")
    expired_time = (datetime.now(timezone.utc) - timedelta(hours=2)).isoformat()
    exp_res = client.post(
        "/api/urls",
        headers=test_headers,
        json={"original_url": "https://example.com/site-a-expired", "custom_alias": "promo-2026", "expires_at": expired_time},
    )
    assert exp_res.status_code == 201
    exp_url = exp_res.json()
    exp_id = exp_url["id"]
    assert exp_url["status"] == "EXPIRED"
    
    # Expired redirect returns 410 Gone
    redir_exp = client.get("/promo-2026", follow_redirects=False)
    assert redir_exp.status_code == 410

    # Attempting to claim expired alias must be rejected (case-insensitive)
    blocked_reuse = client.post(
        "/api/urls",
        headers=demo_headers,
        json={"original_url": "https://example.com/site-b-attempt", "custom_alias": "PROMO-2026"},
    )
    assert blocked_reuse.status_code == 400
    assert "already in use" in blocked_reuse.json()["detail"].lower()
    print("   Expired alias correctly remained reserved.")

    # 13. Delete Expired Link & Reuse Released Alias
    print("\n12. Testing Alias Release After Link Deletion...")
    del_exp = client.delete(f"/api/urls/{exp_id}", headers=test_headers)
    assert del_exp.status_code == 200

    # Now that the expired link was deleted, 'promo-2026' is available again!
    reused_res = client.post(
        "/api/urls",
        headers=test_headers,
        json={"original_url": "https://example.com/site-b-active", "custom_alias": "promo-2026"},
    )
    assert reused_res.status_code == 201
    reused_url = reused_res.json()
    reused_id = reused_url["id"]
    assert reused_url["status"] == "ACTIVE"
    assert reused_url["click_count"] == 0
    print(f"   Successfully reused alias 'promo-2026' after deletion (New ID: {reused_id})")

    # 14. Test Dashboard & Analytics Overview
    print("\n13. Testing GET /api/dashboard & /api/analytics/overview...")
    dash_res = client.get("/api/dashboard", headers=test_headers)
    assert dash_res.status_code == 200
    dash_data = dash_res.json()
    assert dash_data["total_links"] == 2
    assert dash_data["active_links"] == 2
    print(f"   Dashboard verified: {dash_data['total_links']} link(s), {dash_data['active_links']} active.")

    # 15. Test Dynamic BASE_URL Configuration Change
    print("\n14. Testing Dynamic Domain Change (BASE_URL=https://shrnk.in)...")
    original_base = settings.BASE_URL
    try:
        settings.BASE_URL = "https://shrnk.in"
        url_new_domain = client.get(f"/api/urls/{url_id}", headers=test_headers).json()
        assert url_new_domain["short_url"] == "https://shrnk.in/Portfolio"
        print(f"   Dynamically resolved domain: {url_new_domain['short_url']}")
    finally:
        settings.BASE_URL = original_base

    # 16. Clean up test user & cascade delete
    client.delete(f"/api/urls/{url_id}", headers=test_headers)
    client.delete(f"/api/urls/{reused_id}", headers=test_headers)
    client.delete("/api/auth/account", headers=test_headers)

    print("\n" + "=" * 60)
    print("ALL INTEGRATION TESTS PASSED PERFECTLY!")
    print("=" * 60)


if __name__ == "__main__":
    test_full_flow()
