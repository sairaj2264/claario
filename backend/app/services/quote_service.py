from app.models.quote import Quote
from app.models import db
import random

class QuoteService:
    @staticmethod
    def get_all_quotes():
        """Get all quotes from the database"""
        return Quote.query.all()
    
    @staticmethod
    def get_quote_by_id(quote_id):
        """Get a specific quote by ID"""
        return Quote.query.get(quote_id)
    
    @staticmethod
    def get_random_quote(exclude_ids=None):
        """
        Get a random quote, excluding specific IDs to prevent repetition
        
        Args:
            exclude_ids (list): List of quote IDs to exclude
            
        Returns:
            Quote: A random quote object or None if no quotes available
        """
        query = Quote.query
        
        # Exclude specific IDs if provided
        if exclude_ids:
            query = query.filter(~Quote.id.in_(exclude_ids))
            
        # Get all matching quotes
        quotes = query.all()
        
        # Return random quote or None if no quotes
        if quotes:
            return random.choice(quotes)
        return None
    
    @staticmethod
    def create_quote(text, author=None, category=None):
        """
        Create a new quote
        
        Args:
            text (str): The quote text
            author (str, optional): The quote author
            category (str, optional): The quote category
            
        Returns:
            Quote: The created quote object
        """
        quote = Quote(text=text, author=author, category=category)
        db.session.add(quote)
        db.session.commit()
        return quote
    
    @staticmethod
    def update_quote(quote_id, text=None, author=None, category=None):
        """
        Update an existing quote
        
        Args:
            quote_id (int): The ID of the quote to update
            text (str, optional): The new quote text
            author (str, optional): The new quote author
            category (str, optional): The new quote category
            
        Returns:
            Quote: The updated quote object or None if not found
        """
        quote = Quote.query.get(quote_id)
        if quote:
            if text is not None:
                quote.text = text
            if author is not None:
                quote.author = author
            if category is not None:
                quote.category = category
            db.session.commit()
        return quote
    
    @staticmethod
    def delete_quote(quote_id):
        """
        Delete a quote
        
        Args:
            quote_id (int): The ID of the quote to delete
            
        Returns:
            bool: True if deleted, False if not found
        """
        quote = Quote.query.get(quote_id)
        if quote:
            db.session.delete(quote)
            db.session.commit()
            return True
        return False
    
    @staticmethod
    def get_quotes_count():
        """Get the total number of quotes"""
        return Quote.query.count()