#!/usr/bin/env python3
"""
Convert SQL INSERT statements to CSV format
Extracts contact data from contacts_insert_final.sql and creates a CSV file
"""

import re
import csv
import os

def extract_contacts_from_sql(sql_file_path):
    """
    Extract contact data from SQL INSERT statements
    """
    contacts = []
    
    with open(sql_file_path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Regular expression to match INSERT statements
    # Pattern: INSERT INTO contacts (name, phone) VALUES ('NAME', 'PHONE');
    pattern = r"INSERT INTO contacts \(name, phone\) VALUES \('([^']+)', '([^']+)'\);"
    
    matches = re.findall(pattern, content)
    
    for match in matches:
        name, phone = match
        contacts.append({
            'name': name.strip(),
            'phone': phone.strip()
        })
    
    return contacts

def save_to_csv(contacts, csv_file_path):
    """
    Save contacts to CSV file
    """
    with open(csv_file_path, 'w', newline='', encoding='utf-8') as csvfile:
        fieldnames = ['name', 'phone']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        
        # Write header
        writer.writeheader()
        
        # Write contact data
        for contact in contacts:
            writer.writerow(contact)

def main():
    # File paths
    sql_file = 'contacts_insert_final.sql'
    csv_file = 'contacts.csv'
    
    # Check if SQL file exists
    if not os.path.exists(sql_file):
        print(f"Error: {sql_file} not found!")
        return
    
    print(f"Reading SQL data from {sql_file}...")
    
    # Extract contacts from SQL
    contacts = extract_contacts_from_sql(sql_file)
    
    print(f"Found {len(contacts)} contacts")
    
    # Save to CSV
    save_to_csv(contacts, csv_file)
    
    print(f"Successfully created {csv_file} with {len(contacts)} contacts")
    
    # Show first few records as sample
    print("\nFirst 5 contacts:")
    for i, contact in enumerate(contacts[:5], 1):
        print(f"{i}. {contact['name']} - {contact['phone']}")

if __name__ == "__main__":
    main()
