from flask import Blueprint, jsonify, request
from app.services.quote_service import QuoteService

quote_bp = Blueprint('quote', __name__)

@quote_bp.route('/api/quotes', methods=['GET'])
def get_quotes():
    """Get all quotes"""
    quotes = QuoteService.get_all_quotes()
    return jsonify([quote.to_dict() for quote in quotes])

@quote_bp.route('/api/quotes/random', methods=['GET'])
def get_random_quote():
    """
    Get a random quote
    Query parameters:
        exclude_ids: Comma-separated list of quote IDs to exclude
    """
    exclude_ids = request.args.get('exclude_ids')
    if exclude_ids:
        try:
            exclude_ids = [int(id.strip()) for id in exclude_ids.split(',')]
        except ValueError:
            return jsonify({"error": "Invalid exclude_ids parameter"}), 400
    else:
        exclude_ids = []
    
    quote = QuoteService.get_random_quote(exclude_ids)
    if quote:
        return jsonify(quote.to_dict())
    return jsonify({"error": "No quotes available"}), 404

@quote_bp.route('/api/quotes', methods=['POST'])
def create_quote():
    """Create a new quote"""
    data = request.get_json()
    text = data.get('text')
    author = data.get('author')
    category = data.get('category')
    
    if not text:
        return jsonify({"error": "Text is required"}), 400
    
    quote = QuoteService.create_quote(text, author, category)
    return jsonify(quote.to_dict()), 201

@quote_bp.route('/api/quotes/<int:quote_id>', methods=['GET'])
def get_quote(quote_id):
    """Get a specific quote by ID"""
    quote = QuoteService.get_quote_by_id(quote_id)
    if quote:
        return jsonify(quote.to_dict())
    return jsonify({"error": "Quote not found"}), 404

@quote_bp.route('/api/quotes/<int:quote_id>', methods=['PUT'])
def update_quote(quote_id):
    """Update a specific quote"""
    quote = QuoteService.get_quote_by_id(quote_id)
    if not quote:
        return jsonify({"error": "Quote not found"}), 404
    
    data = request.get_json()
    text = data.get('text')
    author = data.get('author')
    category = data.get('category')
    
    if text is None and author is None and category is None:
        return jsonify({"error": "At least one field (text, author, category) is required"}), 400
    
    updated_quote = QuoteService.update_quote(quote_id, text, author, category)
    return jsonify(updated_quote.to_dict())

@quote_bp.route('/api/quotes/<int:quote_id>', methods=['DELETE'])
def delete_quote(quote_id):
    """Delete a specific quote"""
    result = QuoteService.delete_quote(quote_id)
    if result:
        return jsonify({"message": "Quote deleted successfully"})
    return jsonify({"error": "Quote not found"}), 404