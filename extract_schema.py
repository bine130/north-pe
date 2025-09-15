import sqlite3
import json

def get_db_schema(db_path):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    schema_info = {
        'tables': {},
        'indexes': [],
        'triggers': []
    }

    # Get all tables
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';")
    tables = cursor.fetchall()

    for table in tables:
        table_name = table[0]
        schema_info['tables'][table_name] = {
            'columns': [],
            'create_sql': '',
            'sample_data': []
        }

        # Get table creation SQL
        cursor.execute(f"SELECT sql FROM sqlite_master WHERE type='table' AND name='{table_name}';")
        create_sql = cursor.fetchone()[0]
        schema_info['tables'][table_name]['create_sql'] = create_sql

        # Get columns info
        cursor.execute(f"PRAGMA table_info({table_name});")
        columns = cursor.fetchall()
        for col in columns:
            schema_info['tables'][table_name]['columns'].append({
                'cid': col[0],
                'name': col[1],
                'type': col[2],
                'notnull': col[3],
                'default': col[4],
                'pk': col[5]
            })

        # Get sample data (first 5 rows)
        cursor.execute(f"SELECT * FROM {table_name} LIMIT 5;")
        sample_data = cursor.fetchall()
        schema_info['tables'][table_name]['sample_data'] = sample_data

        # Get row count
        cursor.execute(f"SELECT COUNT(*) FROM {table_name};")
        count = cursor.fetchone()[0]
        schema_info['tables'][table_name]['row_count'] = count

    # Get indexes
    cursor.execute("SELECT name, sql FROM sqlite_master WHERE type='index' AND sql IS NOT NULL;")
    indexes = cursor.fetchall()
    for index in indexes:
        schema_info['indexes'].append({
            'name': index[0],
            'sql': index[1]
        })

    # Get triggers
    cursor.execute("SELECT name, sql FROM sqlite_master WHERE type='trigger';")
    triggers = cursor.fetchall()
    for trigger in triggers:
        schema_info['triggers'].append({
            'name': trigger[0],
            'sql': trigger[1]
        })

    conn.close()
    return schema_info

# Extract schema
schema = get_db_schema('backend/north_pe.db')

# Print summary
print("=" * 60)
print("DATABASE SCHEMA SUMMARY")
print("=" * 60)

for table_name, table_info in schema['tables'].items():
    print(f"\nTable: {table_name}")
    print(f"Rows: {table_info['row_count']}")
    print("Columns:")
    for col in table_info['columns']:
        pk_indicator = " [PK]" if col['pk'] else ""
        notnull = " NOT NULL" if col['notnull'] else ""
        default = f" DEFAULT {col['default']}" if col['default'] else ""
        print(f"  - {col['name']}: {col['type']}{pk_indicator}{notnull}{default}")

    print("\nCreate SQL:")
    print(table_info['create_sql'])
    print("-" * 40)

print(f"\nTotal Indexes: {len(schema['indexes'])}")
for idx in schema['indexes']:
    print(f"  - {idx['name']}")

print(f"\nTotal Triggers: {len(schema['triggers'])}")
for trigger in schema['triggers']:
    print(f"  - {trigger['name']}")

# Save to JSON
with open('db_schema.json', 'w', encoding='utf-8') as f:
    json.dump(schema, f, ensure_ascii=False, indent=2, default=str)

print("\n\nFull schema saved to db_schema.json")