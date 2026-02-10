import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

const mock = new MockAdapter(axios);

export const fakeUsers = [
  {
    id: '1',
    email: 'user@demo.com',
    username: 'demo_user',
    password: '123456',
    firstName: 'Demo',
    lastName: 'User',
    role: 'User',
    token: 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9....'
  },
  {
    id: '2',
    email: 'admin@demo.com',
    username: 'demo_admin',
    password: '123456',
    firstName: 'Admin',
    lastName: 'User',
    role: 'Admin',
    token: 'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9....'
  }
];

export default function configureFakeBackend() {
  // ✅ Only mock login
  mock.onPost('/login').reply(config => {
    return new Promise(resolve => {
      setTimeout(() => {
        const params = JSON.parse(config.data);

        const filteredUsers = fakeUsers.filter(user => {
          return user.email === params.email && user.password === params.password;
        });

        if (filteredUsers.length) {
          const user = filteredUsers[0];
          resolve([200, user]);
        } else {
          resolve([401, { error: 'Email or password is incorrect' }]);
        }
      }, 1000);
    });
  });

  // ✅ Let all other requests hit the real backend
  mock.onAny().passThrough();
}
