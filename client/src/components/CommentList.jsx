import { useState } from "react";
import { Form, Button, ListGroup } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";

export default function CommentList({ comments, onAddComment, onDeleteComment }) {
    const { user } = useAuth();
    const [text, setText] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!text.trim()) return;
        setSubmitting(true);
        try {
            await onAddComment(text.trim());
            setText("");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div>
            <h6 className="mb-3">Comments</h6>
            <ListGroup variant="flush" className="mb-3">
                {comments.length === 0 && <p className="text-muted small">No comments yet.</p>}
                {comments.map((c) => (
                    <ListGroup.Item key={c.id} className="px-0 d-flex justify-content-between align-items-start">
                        <div>
                            <span className="fw-semibold">@{c.username}</span>{" "}
                            <span>{c.text}</span>
                        </div>
                        {user && user.id === c.user_id && (
                            <Button size="sm" variant="link" className="text-danger p-0" onClick={() => onDeleteComment(c.id)}>
                                Delete
                            </Button>
                        )}
                    </ListGroup.Item>
                ))}
            </ListGroup>

            {user ? (
                <Form onSubmit={handleSubmit} className="d-flex gap-2">
                    <Form.Control
                        placeholder="Add a comment..."
                        value={text}
                        maxLength={500}
                        onChange={(e) => setText(e.target.value)}
                    />
                    <Button type="submit" disabled={submitting || !text.trim()}>
                        Post
                    </Button>
                </Form>
            ) : (
                <p className="small text-muted">Log in to comment.</p>
            )}
        </div>
    );
}
