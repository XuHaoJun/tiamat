// JSON schema routes
// see http://json-schema.org/
import { Router } from 'express';

import SlateSchema from '../../client/components/Slate/jsonSchema.json';
import LoginFormSchema from '../../client/modules/User/components/LogInForm/schema.json';
import SignFormSchema from '../../client/modules/User/components/SignUpForm/schema.json';
import RootDiscussionForm from '../../client/modules/Discussion/components/RootDiscussionForm/schema.json';
import ChildDiscussionForm from '../../client/modules/Discussion/components/ChildDiscussionForm/schema.json';

const router = new Router();

function schemaRoute(schema) {
  return (req, res) => {
    res.json(schema);
  };
}

router.get('/schemas/slate.json', schemaRoute(SlateSchema));

router.get('/schemas/loginForm.json', schemaRoute(LoginFormSchema));

router.get('/schemas/signUpForm.json', schemaRoute(SignFormSchema));

router.get('/schemas/rootDiscussionForm.json', schemaRoute(RootDiscussionForm));

router.get('/schemas/childDiscussionForm.json', schemaRoute(ChildDiscussionForm));

export default router;
