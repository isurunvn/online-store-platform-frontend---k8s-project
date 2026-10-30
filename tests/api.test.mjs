import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
import axios from 'axios';

const requests = [];
globalThis.testApi = {
  get: async url => { requests.push({url}); return {data: []}; },
  post: async (url, data) => { requests.push({url, data}); return {data}; }
};
async function loadService(name) {
  const source = fs.readFileSync(new URL(`../src/api/services/${name}.ts`, import.meta.url), 'utf8');
  const js = ts.transpileModule(source, {compilerOptions: {module: ts.ModuleKind.ESNext}}).outputText
    .replace(/import api from ['"]\.\.\/axios['"];?/, 'const api = globalThis.testApi;')
    .replaceAll('import.meta.env', '({})');
  return import('data:text/javascript;base64,' + Buffer.from(js).toString('base64'));
}

test('same-origin product requests contain exactly one API prefix', async () => {
  const {productService} = await loadService('productService');
  await productService.getProducts();
  assert.equal(requests.at(-1).url, '/api/products?page=0&size=10');
  const source = fs.readFileSync(new URL('../src/api/axios.ts', import.meta.url), 'utf8');
  const baseURL = source.match(/baseURL:\s*['"]([^'"]+)/)[1];
  assert.equal(axios.create({baseURL}).getUri({url: requests.at(-1).url}), '/api/products?page=0&size=10');
});

test('checkout sends items using the backend request contract', async () => {
  const source = fs.readFileSync(new URL('../src/pages/CartPage.tsx', import.meta.url), 'utf8');
  assert.match(source, /items: cartItems\.map/);
  const {orderService} = await loadService('orderService');
  const payload = {items: [{productId: 1, quantity: 2}]};
  await orderService.createOrder(payload);
  assert.equal(requests.at(-1).url, '/api/orders');
  assert.deepEqual(requests.at(-1).data, payload);
});

test('profile and category creation use the shared API origin', async () => {
  const {userService} = await loadService('userService');
  await userService.getMe();
  assert.equal(requests.at(-1).url, '/api/users/me');
  const {productService} = await loadService('productService');
  await productService.createCategory('Demo');
  assert.deepEqual(requests.at(-1), {url: '/api/categories', data: {name: 'Demo'}});
});
