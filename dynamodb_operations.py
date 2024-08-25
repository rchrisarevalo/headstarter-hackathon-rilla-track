import boto3
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource('dynamodb', region_name='us-east-2')
table = dynamodb.Table('User_Comments')

def add_comment(id, name, transcription, summary, comments):
    table.put_item(
        Item={
            'id': id,
            "name": name,
            'transcription': transcription,
            'summary': summary,
            "comments": comments
        }
    )

def get_comment(id):
    response = table.get_item(
        Key={
            'id': id
        }
    )
    return response.get('Item')

def update_comment(id, user_comment=None, transcription=None, summary=None):
    update_expression = []
    expression_attribute_values = {}

    if user_comment:
        update_expression.append("user_comment = :u")
        expression_attribute_values[":u"] = user_comment
    if transcription:
        update_expression.append("transcription = :t")
        expression_attribute_values[":t"] = transcription
    if summary:
        update_expression.append("summary = :s")
        expression_attribute_values[":s"] = summary

    table.update_item(
        Key={
            'id': id
        },
        UpdateExpression="SET " + ", ".join(update_expression),
        ExpressionAttributeValues=expression_attribute_values
    )

comments = [
    {
        "text": "This is a comment.",
        "type": ["positive"] | ["negative"],
        "hightlight": [int, int],
    }

if __name__ == "__main__":
    add_comment('1', 'John Doe', 'This is an example transcription', 'This is an example summary', comments)
    print(get_comment('1'))
    update_comment('1', user_comment='Updated example comment')
    print(get_comment('1'))