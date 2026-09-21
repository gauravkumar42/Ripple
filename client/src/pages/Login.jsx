import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container, Form, Button, Alert, Card } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setSubmitting(true);
        setError("");
        try {
            await login(username, password);
            navigate("/");
        } catch (err) {
            setError(err.response?.data?.error || "Login failed.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <Container style={{ maxWidth: 400 }}>
            <Card className="p-4 shadow-sm">
                <h4 className="mb-3">Log in</h4>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Username or email</Form.Label>
                        <Form.Control value={username} onChange={(e) => setUsername(e.target.value)} required />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </Form.Group>
                    <Button type="submit" className="w-100" disabled={submitting}>
                        Log in
                    </Button>
                </Form>
                <p className="text-center small mt-3 mb-0">
                    No account? <Link to="/register">Sign up</Link>
                </p>
            </Card>
        </Container>
    );
}
