import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container, Form, Button, Alert, Spinner } from "react-bootstrap";
import client from "../api/client";

export default function EditPost() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        client
            .get(`/posts/${id}`)
            .then((res) => setContent(res.data.post.content))
            .catch(() => setError("Couldn't load this post."))
            .finally(() => setLoading(false));
    }, [id]);

    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitting(true);
        setError("");
        try {
            await client.patch(`/posts/${id}`, { content });
            navigate(`/posts/${id}`);
        } catch (err) {
            setError(err.response?.data?.error || "Couldn't save changes.");
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) return <Spinner animation="border" size="sm" />;

    return (
        <Container style={{ maxWidth: 500 }}>
            <h4 className="mb-4">Edit post</h4>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Control
                        as="textarea"
                        rows={4}
                        maxLength={2000}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                    />
                </Form.Group>
                <Button type="submit" disabled={submitting || !content.trim()}>
                    Save changes
                </Button>
            </Form>
        </Container>
    );
}
