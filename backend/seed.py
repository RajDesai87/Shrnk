from datetime import datetime, timezone, timedelta
import random
from sqlalchemy.orm import Session
from backend.models import User, URL, Click
from backend.security import hash_password


def seed_demo_user(db: Session):
    """
    Idempotently seeds a development/demo user.
    Email: user1@gmail.com
    Password: Password@123
    Name: Demo User
    
    If the user already exists, this does nothing and will not overwrite passwords.
    """
    demo_email = "user1@gmail.com"
    existing_user = db.query(User).filter(User.email == demo_email).first()
    if existing_user:
        return existing_user

    print(f"[*] Seeding demo user: {demo_email}")
    demo_user = User(
        name="Demo User",
        email=demo_email,
        password_hash=hash_password("Password@123"),
    )
    db.add(demo_user)
    db.commit()
    db.refresh(demo_user)

    # Seed initial demo URLs
    sample_links = [
        {
            "code": "a7Kx92",
            "url": "https://github.com/RajDesai87/Shrnk",
            "clicks": 1284,
            "days_ago": 12,
        },
        {
            "code": "Qm3vTz",
            "url": "https://docs.shrnk.in/getting-started/api",
            "clicks": 842,
            "days_ago": 8,
        },
        {
            "code": "kb91Rd",
            "url": "https://notion.so/team/q3-launch-checklist",
            "clicks": 417,
            "days_ago": 5,
        },
        {
            "code": "9pLmXe",
            "url": "https://youtube.com/watch?v=dQw4w9WgXcQ",
            "clicks": 96,
            "days_ago": 2,
        },
        {
            "code": "5bK9qL",
            "url": "https://figma.com/@raj/design-system",
            "clicks": 64,
            "days_ago": 1,
        },
    ]

    referrers = ["https://x.com", "https://github.com", "https://linkedin.com", "https://google.com", None]
    user_agents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "Mozilla/5.0 (X11; Linux x86_64; rv:123.0) Gecko/20100101 Firefox/123.0",
    ]

    now = datetime.now(timezone.utc)

    for item in sample_links:
        created_at = now - timedelta(days=item["days_ago"])
        url_record = URL(
            user_id=demo_user.id,
            short_code=item["code"],
            original_url=item["url"],
            created_at=created_at,
            is_active=True,
            click_count=item["clicks"],
        )
        db.add(url_record)
        db.commit()
        db.refresh(url_record)

        # Generate representative recent click distribution across the last 7 days
        # for realistic charts
        clicks_to_seed = min(item["clicks"], 35)
        for _ in range(clicks_to_seed):
            click_time = now - timedelta(
                days=random.randint(0, 6),
                hours=random.randint(0, 23),
                minutes=random.randint(0, 59),
            )
            click = Click(
                url_id=url_record.id,
                clicked_at=click_time,
                ip_address=f"192.168.1.{random.randint(2, 250)}",
                user_agent=random.choice(user_agents),
                referrer=random.choice(referrers),
            )
            db.add(click)

    db.commit()
    print("[*] Demo user and initial links seeded successfully.")
    return demo_user
