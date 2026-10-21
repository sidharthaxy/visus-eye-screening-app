// GET /profiles, POST /profiles, PATCH /profiles/:id
import { Profile } from '@visus/shared';
import { Hono } from 'hono';

import type { AppEnv } from '../../lib/env';
import { validate } from '../../lib/validate';
import { requireAuth } from '../auth/auth.middleware';
import { createProfile, listProfiles, updateProfile } from './profiles.service';

const NewProfile = Profile.omit({ id: true });

export const profilesRoutes = new Hono<AppEnv>();
profilesRoutes.use('*', requireAuth);

profilesRoutes.get('/', async (c) => c.json(await listProfiles(c.var.db, c.var.userId)));

profilesRoutes.post('/', validate('json', NewProfile), async (c) => c.json(await createProfile(c.var.db, c.var.userId, c.req.valid('json')), 201));

profilesRoutes.patch('/:id', validate('json', NewProfile.partial()), async (c) =>
  c.json(await updateProfile(c.var.db, c.var.userId, c.req.param('id'), c.req.valid('json'))),
);
