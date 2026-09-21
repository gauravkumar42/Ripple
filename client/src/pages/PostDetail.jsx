import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Container, Spinner, Alert, Button, Card } from "react-bootstrap";
import client from "../api/client";
import CommentList from "../components/CommentList";
import { useAuth } from "../context/AuthContext";

export default function PostDetail() {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    function load() {
        setLoading(true);
        client
            .get(`/posts/${id}`)
            .then((res) => {
                setPost(res.data.post);
                setComments(res.data.comments);
            })
            .catch(() => setError("Post not found."))
            .finally(() => setLoading(false));
    }

    useEffect(load, [id]);

    async function handleToggleLike() {
        if (!user) return;
        const res = await client.post(`/posts/${id}/like`);
        setPost((p) => ({ ...p, liked_by_me: res.data.liked, like_count: res.data.like_count }));
    }

    async function handleDelete() {
        if (!window.confirm("Delete this post?")) return;
        await client.delete(`/posts/${id}`);
        navigate("/");
    }

    async function handleAddComment(text) {
        await client.post(`/posts/${id}/comments`, { text });
        load();
    }

    async function handleDeleteComment(commentId) {
        await client.delete(`/posts/${id}/comments/${commentId}`);
        load();
    }

    if (loading) return <Spinner animation="border" size="sm" />;
    if (error) return <Alert variant="danger">{error}</Alert>;

    const isAuthor = user && post.user_id === user.id;

    return (
        <Container style={{ maxWidth: 600 }}>
            <Card className="mb-4 shadow-sm">
                <Card.Body>
                    <div className="d-flex justify-content-between">
                        <span className="fw-semibold">@{post.username}</span>
                        {isAuthor && (
                            <div className="d-flex gap-2">
                                <Button as={Link} to={`/posts/${id}/edit`} size="sm" variant="outline-secondary">
                                    Edit
                                </Button>
                                <Button size="sm" variant="outline-danger" onClick={handleDelete}>
                                    Delete
                                </Button>
                            </div>
                        )}
                    </div>
                    <p className="mt-2 mb-3">{post.content}</p>
                    <Button
                        size="sm"
                        variant={post.liked_by_me ? "primary" : "outline-primary"}
                        onClick={handleToggleLike}
                        disabled={!user}
                    >
                        {post.liked_by_me ? "Liked" : "Like"} · {post.like_count}
                    </Button>
                </Card.Body>
            </Card>

            <CommentList comments={comments} onAddComment={handleAddComment} onDeleteComment={handleDeleteComment} />
        </Container>
    );
}
