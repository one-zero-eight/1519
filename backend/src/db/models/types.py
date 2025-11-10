import datetime

from sqlalchemy import types


class UTCDateTime(types.TypeDecorator):
    """
    Stores datetime as UTC in the database (timezone-naive).
    Converts to UTC on the way in, adds UTC timezone on the way out.
    """
    impl = types.DateTime
    cache_ok = True

    def process_bind_param(self, value, dialect):
        """Convert timezone-aware datetime to UTC naive before storing"""
        if value is not None:
            if value.tzinfo is None:
                raise ValueError("Naive datetime not allowed")
            return value.astimezone(datetime.UTC).replace(tzinfo=None)
        return value

    def process_result_value(self, value, dialect):
        """Add UTC timezone to naive datetime when retrieving"""
        if value is not None:
            return value.replace(tzinfo=datetime.UTC)
        return value
