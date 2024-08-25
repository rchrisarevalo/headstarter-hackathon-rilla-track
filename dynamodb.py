import boto3
from boto3.dynamodb.conditions import Key

def create_dynamodb_table():
    dynamodb = boto3.resource('dynamodb', region_name='us-east-2')

    table = dynamodb.create_table(
        TableName='User_Comments',
        KeySchema=[
            {
                'AttributeName': 'id',
                'KeyType': 'HASH'  # Partition key
            }
        ],
        AttributeDefinitions=[
            {
                'AttributeName': 'id',
                'AttributeType': 'S'
            }
        ],
        ProvisionedThroughput={
            'ReadCapacityUnits': 5,
            'WriteCapacityUnits': 5
        }
    )

    table.wait_until_exists()
    print("Table created successfully.")

if __name__ == "__main__":
    create_dynamodb_table()