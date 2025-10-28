import re

class ContentModerationService:
    def __init__(self):
        # Define patterns for different types of content to moderate
        self.profanity_words = [
            'damn', 'hell', 'ass', 'arse', 'arsehole', 'asshole', 'bastard', 'bitch', 'bloody',
            'bollocks', 'bugger', 'bullshit', 'crap', 'cunt', 'damn', 'dick', 'dickhead',
            'faggot', 'frigger', 'fuck', 'fucker', 'fucking', 'goddamn', 'idiot', 'jackass',
            'jerk', 'moron', 'motherfucker', 'nigga', 'nigger', 'piss', 'prick', 'pussy',
            'shit', 'shite', 'slut', 'twat', 'wanker', 'whore', 'arse', 'arsehole', 'asshole',
            'ballsack', 'blowjob', 'boner', 'clitoris', 'cock', 'cum', 'cunnilingus', 'dildo',
            'dyke', 'fag', 'fellatio', 'felching', 'fucktard', 'handjob', 'jizz', 'labia',
            'muff', 'nipples', 'penis', 'piss', 'poop', 'scrotum', 'sex', 'shit', 'slut',
            'smegma', 'spunk', 'tit', 'tosser', 'turd', 'twat', 'vagina', 'wank', 'whore'
        ]
        
        # Pattern for email addresses
        self.email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        
        # Pattern for phone numbers (various formats)
        self.phone_patterns = [
            r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b',  # 123-456-7890 or 123.456.7890 or 1234567890
            r'\b\(\d{3}\)\s*\d{3}[-.]?\d{4}\b',  # (123) 456-7890
            r'\b\d{3}\s+\d{3}\s+\d{4}\b',  # 123 456 7890
            r'\+\d{1,3}[-.]?\d{3,4}[-.]?\d{3,4}[-.]?\d{3,4}'  # International format
        ]
        
        # Patterns for personal identifying information
        self.ssn_pattern = r'\b\d{3}-?\d{2}-?\d{4}\b'  # Social Security Number
        self.credit_card_pattern = r'\b(?:\d{4}[-\s]?){3}\d{4}\b|\b\d{16}\b'  # Credit card
        
        # Harmful drug names
        self.drug_names = [
            'cocaine', 'heroin', 'meth', 'methamphetamine', 'crack', 'opium', 'lsd', 'ecstasy',
            'mdma', 'ketamine', 'pcp', 'marijuana', 'cannabis', 'weed', 'pot', 'hash', 'hashish',
            'acid', 'shrooms', 'magic mushrooms', 'peyote', 'mescaline', 'dmt', 'ayahuasca',
            'salvia', 'krokodil', 'bath salts', 'synthetic marijuana', 'spice', 'k2'
        ]
        
        # Compile regex patterns for efficiency
        self.compiled_email_pattern = re.compile(self.email_pattern, re.IGNORECASE)
        self.compiled_phone_patterns = [re.compile(pattern, re.IGNORECASE) for pattern in self.phone_patterns]
        self.compiled_ssn_pattern = re.compile(self.ssn_pattern, re.IGNORECASE)
        self.compiled_credit_card_pattern = re.compile(self.credit_card_pattern, re.IGNORECASE)
        
        # Create a combined profanity pattern for faster checking
        escaped_profanity = [re.escape(word) for word in self.profanity_words]
        self.profanity_pattern = re.compile(r'\b(' + '|'.join(escaped_profanity) + r')\b', re.IGNORECASE)
        
        # Create a combined drug pattern
        escaped_drugs = [re.escape(drug) for drug in self.drug_names]
        self.drug_pattern = re.compile(r'\b(' + '|'.join(escaped_drugs) + r')\b', re.IGNORECASE)

    def contains_profanity(self, text):
        """Check if text contains profanity."""
        return bool(self.profanity_pattern.search(text))

    def contains_email(self, text):
        """Check if text contains email addresses."""
        return bool(self.compiled_email_pattern.search(text))

    def contains_phone_number(self, text):
        """Check if text contains phone numbers."""
        for pattern in self.compiled_phone_patterns:
            if pattern.search(text):
                return True
        return False

    def contains_ssn(self, text):
        """Check if text contains social security numbers."""
        return bool(self.compiled_ssn_pattern.search(text))

    def contains_credit_card(self, text):
        """Check if text contains credit card numbers."""
        return bool(self.compiled_credit_card_pattern.search(text))

    def contains_drug_references(self, text):
        """Check if text contains references to harmful drugs."""
        return bool(self.drug_pattern.search(text))

    def moderate_content(self, text):
        """
        Moderate content and return a dictionary with findings.
        
        Returns:
            dict: Contains 'is_appropriate' (bool) and 'violations' (list of violation types)
        """
        violations = []
        
        # Check for different types of violations
        if self.contains_profanity(text):
            violations.append('profanity')
            
        if self.contains_email(text):
            violations.append('email')
            
        if self.contains_phone_number(text):
            violations.append('phone')
            
        if self.contains_ssn(text):
            violations.append('ssn')
            
        if self.contains_credit_card(text):
            violations.append('credit_card')
            
        if self.contains_drug_references(text):
            violations.append('drugs')
        
        # Content is appropriate if no violations found
        is_appropriate = len(violations) == 0
        
        return {
            'is_appropriate': is_appropriate,
            'violations': violations
        }

    def censor_content(self, text):
        """
        Censor inappropriate content in the text.
        
        Returns:
            tuple: (censored_text, violations_found)
        """
        violations = []
        censored_text = text
        
        # Censor profanity
        if self.contains_profanity(censored_text):
            censored_text = self.profanity_pattern.sub('****', censored_text)
            violations.append('profanity')
            
        # Censor emails
        if self.contains_email(censored_text):
            censored_text = self.compiled_email_pattern.sub('****@****.***', censored_text)
            violations.append('email')
            
        # Censor phone numbers
        for pattern in self.compiled_phone_patterns:
            if pattern.search(censored_text):
                censored_text = pattern.sub('****-****-****', censored_text)
                if 'phone' not in violations:
                    violations.append('phone')
                    
        # Censor SSN
        if self.contains_ssn(censored_text):
            censored_text = self.compiled_ssn_pattern.sub('***-**-****', censored_text)
            violations.append('ssn')
            
        # Censor credit cards
        if self.contains_credit_card(censored_text):
            censored_text = self.compiled_credit_card_pattern.sub('****-****-****-****', censored_text)
            violations.append('credit_card')
            
        # Censor drug references
        if self.contains_drug_references(censored_text):
            censored_text = self.drug_pattern.sub('****', censored_text)
            violations.append('drugs')
        
        return censored_text, violations

# Create a global instance for use throughout the application
content_moderation_service = ContentModerationService()