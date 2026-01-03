#!/usr/bin/env python3
"""Test database connection"""
import psycopg2
import sys

try:
    # Try connecting to Docker PostgreSQL
    conn = psycopg2.connect(
        host='127.0.0.1',
        port=5432,
        user='postgres',
        password='postgres',
        database='modele_db'
    )
    print("✅ Connection successful!")
    cur = conn.cursor()
    cur.execute("SELECT version();")
    version = cur.fetchone()
    print(f"PostgreSQL version: {version[0]}")
    conn.close()
    sys.exit(0)
except psycopg2.OperationalError as e:
    print(f"❌ Connection failed: {e}")
    sys.exit(1)
