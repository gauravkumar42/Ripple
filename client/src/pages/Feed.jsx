import { useEffect, useState } from "react";
import { Container, Spinner, Alert, Pagination } from "react-bootstrap";
import client from "../api/client";
import PostCard from "../components/PostCard";
import { useAuth } from "../context/AuthContext";

export default function Feed() {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        setLoading(true);
        client
            .get(`/posts?page=${page}`)
            .then((res) => {
                setPosts(res.data.posts);
                setTotalPages(res.data.totalPages);
                setError("");
            })
            .catch(() => setError("Couldn't load the feed. Is the API running?"))
            .finally(() => setLoading(false));
    }, [page, user]);

    async function handleToggleLike(postId) {
        if (!user) return;
        const res = await client.post(`/posts/${postId}/like`);
        setPosts((prev) =>
            prev.map((p) =>
                p.id === postId ? { ...p, liked_by_me: res.data.liked, like_count: res.data.like_count } : p
            )
        );
    }

    return (
        <Container style={{ maxWidth: 600 }}>
            <h4 className="mb-4">Feed</h4>
            {error && <Alert variant="danger">{error}</Alert>}
            {loading ? (
                <Spinner animation="border" size="sm" />
            ) : (
                <>
                    {posts.map((post) => (
                        <PostCard key={post.id} post={post} onToggleLike={handleToggleLike} />
                    ))}
                    {totalPages > 1 && (
                        <Pagination>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                                <Pagination.Item key={n} active={n === page} onClick={() => setPage(n)}>
                                    {n}
                                </Pagination.Item>
                            ))}
                        </Pagination>
                    )}
                </>
            )}
        </Container>
    );
}
