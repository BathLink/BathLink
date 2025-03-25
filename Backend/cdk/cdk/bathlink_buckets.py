from aws_cdk import aws_s3 as s3


class BathLinkBuckets:

    def __init__(self):
        self.pfp_bucket = None

    def create_buckets(self, stack):
        self.pfp_bucket = s3.Bucket(
            stack, "BathLinkPFPBucket",
            bucket_name="bathlink-pfp",
            block_public_access=None
        )







