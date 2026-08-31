"""
Comprehensive test script for SHRNK database schema, models, relationships, and cascade operations.
"""
from datetime import datetime, timezone, timedelta
from sqlalchemy import inspect
from backend.database import engine, SessionLocal, init_db, Base
from backend.models import User, URL, Click

def run_tests():
    print("=" * 60)
    print("RUNNING SHRNK DATABASE TESTS")
    print("=" * 60)

    # 1. Initialize DB
    print("\n1. Testing Database Initialization...")
    init_db()
    
    inspector = inspect(engine)
    tables = inspector.get_table_names()
    print(f"   Created tables: {tables}")
    assert "users" in tables, "Table 'users' is missing!"
    assert "urls" in tables, "Table 'urls' is missing!"
    assert "clicks" in tables, "Table 'clicks' is missing!"

    # 2. Check indexes
    print("\n2. Verifying Table Indexes...")
    for table_name in ["users", "urls", "clicks"]:
        indexes = inspector.get_indexes(table_name)
        index_cols = [idx["column_names"] for idx in indexes]
        print(f"   Indexes for {table_name}: {index_cols}")

    # 3. Test CRUD & Relationships
    print("\n3. Testing CRUD & Relationships...")
    db = SessionLocal()
    try:
        # Clean up test users if existing from previous runs
        for e in ["test@shrnk.in", "keepme@shrnk.in"]:
            ex = db.query(User).filter(User.email == e).first()
            if ex:
                db.delete(ex)
        db.commit()

        # Create test user
        user = User(
            name="Raj Desai",
            email="test@shrnk.in",
            password_hash="mock_bcrypt_hash_abc123"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        print(f"   Created User: ID={user.id}, Email='{user.email}'")

        # Create URLs for user
        import secrets
        code1 = f"t1_{secrets.token_hex(3)}"
        code2 = f"t2_{secrets.token_hex(3)}"
        url1 = URL(
            user_id=user.id,
            short_code=code1,
            original_url="https://github.com/RajDesai87/Shrnk",
            expires_at=datetime.now(timezone.utc) + timedelta(days=30),
            is_active=True,
            click_count=0
        )
        url2 = URL(
            user_id=user.id,
            short_code=code2,
            original_url="https://example.com/api/docs",
            expires_at=None,
            is_active=True,
            click_count=0
        )
        db.add_all([url1, url2])
        db.commit()
        db.refresh(url1)
        db.refresh(url2)
        print(f"   Created URL 1: ID={url1.id}, Code='{url1.short_code}'")
        print(f"   Created URL 2: ID={url2.id}, Code='{url2.short_code}'")

        # Create Clicks for URL 1
        click1 = Click(
            url_id=url1.id,
            ip_address="127.0.0.1",
            user_agent="Mozilla/5.0 Chrome/120.0",
            referrer="https://x.com"
        )
        click2 = Click(
            url_id=url1.id,
            ip_address="192.168.1.1",
            user_agent="Mozilla/5.0 Firefox/121.0",
            referrer="https://linkedin.com"
        )
        url1.click_count += 2
        db.add_all([click1, click2])
        db.commit()
        print(f"   Created 2 clicks for URL 1. Current URL 1 click_count={url1.click_count}")

        # Verify relationship access
        db.refresh(user)
        assert len(user.urls) == 2, f"Expected 2 URLs for user, got {len(user.urls)}"
        assert len(url1.clicks) == 2, f"Expected 2 clicks for URL 1, got {len(url1.clicks)}"
        print("   Relationships verified successfully (User -> URLs -> Clicks).")

        # 4. Test Cascade Deletion on User Delete
        print("\n4. Testing Cascade Deletion on User Delete...")
        user_id = user.id
        url1_id = url1.id
        
        db.delete(user)
        db.commit()

        # Check that user, urls, and clicks are removed
        user_check = db.query(User).filter(User.id == user_id).first()
        urls_check = db.query(URL).filter(URL.user_id == user_id).all()
        clicks_check = db.query(Click).filter(Click.url_id == url1_id).all()

        assert user_check is None, "User was not deleted!"
        assert len(urls_check) == 0, f"Expected 0 URLs after user delete, found {len(urls_check)}"
        assert len(clicks_check) == 0, f"Expected 0 clicks after user delete, found {len(clicks_check)}"
        print("   Cascade deletion verified successfully! (User delete removed all owned URLs & Clicks)")

        # 5. Test Non-Destructive Re-initialization
        print("\n5. Testing Non-Destructive Table Re-initialization...")
        # Create a fresh record
        new_user = User(
            name="Permanent User",
            email="keepme@shrnk.in",
            password_hash="mock_hash_xyz"
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        saved_id = new_user.id

        # Re-run init_db()
        init_db()

        # Ensure record is still intact
        recheck_user = db.query(User).filter(User.id == saved_id).first()
        assert recheck_user is not None, "Data was destroyed by re-running init_db()!"
        assert recheck_user.email == "keepme@shrnk.in", "User data altered!"
        print("   Non-destructive init_db() verified successfully!")

        # Clean up test user
        db.delete(recheck_user)
        db.commit()

    finally:
        db.close()

    print("\n" + "=" * 60)
    print("ALL TESTS PASSED SUCCESSFULLY!")
    print("=" * 60)

if __name__ == "__main__":
    run_tests()
