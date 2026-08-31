from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, CheckConstraint, func
from sqlalchemy.orm import relationship
from backend.database import Base


class URL(Base):
    """
    URL model representing shortened links in SHRNK.
    An alias/short_code is reserved as long as the record exists in the database.
    Deleting the link permanently releases the alias.
    """
    __tablename__ = "urls"
    __table_args__ = (
        CheckConstraint("click_count >= 0", name="check_click_count_non_negative"),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    short_code = Column(String(64), nullable=False, unique=True, index=True)
    original_url = Column(Text, nullable=False)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        server_default=func.now(),
        index=True,
    )
    expires_at = Column(DateTime(timezone=True), nullable=True)
    is_active = Column(Boolean, nullable=False, default=True)
    click_count = Column(Integer, nullable=False, default=0)

    # Relationships
    user = relationship("User", back_populates="urls")
    clicks = relationship(
        "Click",
        back_populates="url",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    def __repr__(self):
        return f"<URL id={self.id} code='{self.short_code}'>"
