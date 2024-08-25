import boto3
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource('dynamodb', region_name='us-east-2')
table = dynamodb.Table('UserComments')

def add_comment(comment_id, user_comment, transcription, summary):
    table.put_item(
        Item={
            'comment_id': comment_id,
            'user_comment': user_comment,
            'transcription': transcription,
            'summary': summary
        }
    )

def get_comment(comment_id):
    response = table.get_item(
        Key={
            'comment_id': comment_id
        }
    )
    return response.get('Item')

def update_comment(comment_id, user_comment=None, transcription=None, summary=None):
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
            'comment_id': comment_id
        },
        UpdateExpression="SET " + ", ".join(update_expression),
        ExpressionAttributeValues=expression_attribute_values
    )

if __name__ == "__main__":
    add_comment('1', 'This is an example comment', 'This is an example transcription', 'This is an example summary')
    print(get_comment('1'))
    update_comment('1', user_comment='Updated example comment')
    print(get_comment('1'))