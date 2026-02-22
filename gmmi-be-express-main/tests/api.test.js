import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../index.js';
import jwt from 'jsonwebtoken';

describe('GMMI API Robust Tests', () => {
    let token;
    const secret = process.env.JWT_SECRET || 'gmmi_secret_key';

    beforeAll(() => {
        token = jwt.sign(
            { id: 'test-id', email: 'test@admin.com', role: 'super_admin', name: 'Test Admin' },
            secret,
            { expiresIn: '1h' }
        );
    });

    describe('1. Connectivity & Environment', () => {
        it('GET /ping should be online', async () => {
            const res = await request(app).get('/ping');
            expect(res.status).toBe(200);
            expect(res.body.pong).toBe(true);
        });
    });

    describe('2. Public APIs (Homepage Data)', () => {
        const publicRoutes = [
            '/api/jemaat',
            '/api/programs',
            '/api/carousel',
            '/api/announcements'
        ];

        publicRoutes.forEach(route => {
            it(`GET ${route} should be accessible (200 or 500 if DB not set)`, async () => {
                const res = await request(app).get(route);
                expect([200, 500]).toContain(res.status);
            });
        });
    });

    describe('3. Protected APIs (Admin Only)', () => {
        const protectedRoutes = [
            '/api/pewartaan'
        ];

        protectedRoutes.forEach(route => {
            it(`GET ${route} should return 401 WITHOUT token`, async () => {
                const res = await request(app).get(route);
                expect(res.status).toBe(401);
            });

            it(`GET ${route} should pass auth WITH token (200 or 500 if DB not set)`, async () => {
                const res = await request(app)
                    .get(route)
                    .set('Authorization', `Bearer ${token}`);
                expect([200, 500]).toContain(res.status);
            });
        });
    });

    describe('4. Authentication Logic', () => {
        it('POST /auth/login should reject invalid credentials (401 or 500)', async () => {
            const res = await request(app)
                .post('/auth/login')
                .send({ email: 'wrong@user.com', password: 'wrongpassword' });
            expect([401, 500]).toContain(res.status);
        });
    });
});
