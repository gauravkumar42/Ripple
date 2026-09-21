import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Form, Button, Alert } from "react-bootstrap";
import client from "../api/client";

export default function NewPost() {
    const [content, setContent] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitting(true);
        setError("");
        try {
            await client.post("/posts", { content });
            navigate("/");
        } catch (err) {
            setError(err.response?.data?.error || "Couldn't create the post.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Container style={{ maxWidth: 500 }}>
            <h4 className="mb-4">New post</h4>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Control
                        as="textarea"
                        rows={4}
                        placeholder="What's on your mind?"
                        maxLength={2000}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        required
                    />
                </Form.Group>
                <Button type="submit" disabled={submitting || !content.trim()}>
                    Post
                </Button>
            </Form>
        </Container>
    );
}
