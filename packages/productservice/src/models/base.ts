import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";

export abstract class Item {
    abstract get pk(): string;
    abstract get sk(): string;

    public keys(): Record<string, AttributeValue> {
        return marshall({
            PK: this.pk,
            SK: this.sk
        });
    }
}