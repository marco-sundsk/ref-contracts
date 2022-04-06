import { NEAR } from 'near-workspaces-ava';
import { initWorkSpace, assertFailure } from './helper';

const workspace = initWorkSpace();

workspace.test('set_owner', async (test, { contract, owner, alice, bob }) => {
  let md = await contract.view('get_metadata');
  test.log(md);

  test.deepEqual(md, {
    farm_count: '0',
    farm_expire_sec: 2592000,
    farmer_count: '0',
    operators: [],
    owner_id: 'ref_owner.test.near',
    reward_count: '0',
    seed_count: '0',
    version: '2.1.7',
  });

  await owner.call(contract, 'set_owner', { owner_id: alice }, { attachedDeposit: NEAR.from("1") });

  test.is(
    (await contract.view('get_metadata') as any).owner_id,
    alice.accountId,
  );

  await alice.call(contract, 'set_owner', { owner_id: bob }, { attachedDeposit: NEAR.from("1") });

  test.is(
    (await contract.view('get_metadata') as any).owner_id,
    bob.accountId,
  );

  await bob.call(contract, 'set_owner', { owner_id: owner }, { attachedDeposit: NEAR.from("1") });

  test.is(
    (await contract.view('get_metadata') as any).owner_id,
    owner.accountId,
  );
});

workspace.test('manage_operators', async (test, { contract, owner, alice, bob }) => {

  await owner.call(contract, 'extend_operators', { operators: [alice, bob] }, { attachedDeposit: NEAR.from("1") });
  test.deepEqual(
    (await contract.view('get_metadata') as any).operators,
    [alice.accountId, bob.accountId],
  );

  await owner.call(contract, 'remove_operators', { operators: [bob] }, { attachedDeposit: NEAR.from("1") });
  test.deepEqual(
    (await contract.view('get_metadata') as any).operators,
    [alice.accountId],
  );
});

workspace.test('adjust_farm_expire_sec', async (test, { contract, owner, alice, bob }) => {

  assertFailure(
    test,
    alice.call(
      contract, 
      'modify_default_farm_expire_sec', 
      {farm_expire_sec: 2592001}, 
      {attachedDeposit: NEAR.from("1")}
    ),
    'NOT_ALLOWED',
  );

  await owner.call(contract, 'modify_default_farm_expire_sec', { farm_expire_sec: 2592001 }, { attachedDeposit: NEAR.from("1") });
  test.is(
    (await contract.view('get_metadata') as any).farm_expire_sec,
    2592001,
  );
});