import {QdrantClient} from '@qdrant/js-client-rest';

const client = new QdrantClient({
    url: 'https://216328b0-e213-49df-8595-9adcd59caa01.us-east-1-0.aws.cloud.qdrant.io:6333',
    apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.ArmsL0UEyAYI4LB0bjhukD5ZyFGyvcgpvUguoP6VJ1s',
});
export {client}