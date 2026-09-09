"""Run against a disposable DB initialized with fixture.sql + migration. No production defaults."""
import concurrent.futures, json, os, subprocess, uuid, time
url=os.environ['QA_DATABASE_URL']
if '55439' not in url or not ('127.0.0.1' in url or 'localhost' in url):
 raise SystemExit('Only the disposable localhost:55439 database is supported')
def query(sql, user=None, role='authenticated', check=True):
 prefix=''
 if user:
  claims=json.dumps({'amr':[{'method':'password','timestamp':int(time.time())}]})
  prefix=f"SET ROLE {role}; SET request.jwt.claim.sub='{user}'; SET request.jwt.claims='{claims}';"
 result=subprocess.run(['psql',url,'-X','-v','ON_ERROR_STOP=1','-At','-c',prefix+sql],capture_output=True,text=True)
 if check and result.returncode: raise AssertionError(result.stderr)
 return result
passed=[]
def test(name, fn):
 fn(); passed.append(name); print('PASS',name,flush=True)
users=[str(uuid.uuid4()) for _ in range(24)]
admin=users[-1]
for u in users:
 query(f"INSERT INTO auth.users(id,email) VALUES('{u}','{u}@example.com'); INSERT INTO profiles(id,email,role,birth_date) VALUES('{u}','{u}@example.com','{'admin' if u==admin else 'user'}','1990-01-01');")
def blocked(sql,user=users[0],role='authenticated'):
 assert query(sql,user,role,False).returncode != 0, sql

test('normal user cannot promote own role',lambda:blocked(f"UPDATE profiles SET role='admin' WHERE id='{users[0]}';"))
test('normal user cannot create gallery even with legacy permissive policy',lambda:blocked("INSERT INTO galleries(name) VALUES('bad');"))
test('anonymous cannot create gallery',lambda:blocked("INSERT INTO galleries(name) VALUES('bad');",users[0],'anon'))
test('normal user cannot upload Storage object',lambda:blocked("INSERT INTO storage.objects(bucket_id) VALUES('galerias');"))
test('normal user cannot forge consent',lambda:blocked(f"INSERT INTO consent_logs(user_id) VALUES('{users[0]}');"))
test('direct profile update cannot bypass adult age validation',lambda:blocked(f"UPDATE profiles SET birth_date='2099-01-01' WHERE id='{users[0]}';"))
test('admin can create gallery',lambda:query("INSERT INTO galleries(name) VALUES('good');",admin))
def isolate():
 r=query('SELECT count(*) FROM profiles;',users[0]); assert r.stdout.strip().splitlines()[-1]=='1',r.stdout
test('profile SELECT isolates users despite legacy policy',isolate)
def reserve_invalid(capacity,status='published',past=False):
 e=str(uuid.uuid4());query(f"INSERT INTO events(id,capacity,status,start_time) VALUES('{e}',{capacity},'{status}',now()+interval '{'-1' if past else '1'} day');")
 blocked(f"SELECT reserve_event('{e}');")
test('zero capacity rejected',lambda:reserve_invalid(0))
test('draft rejected',lambda:reserve_invalid(5,'draft'))
test('past event rejected',lambda:reserve_invalid(5,past=True))
test('missing event rejected',lambda:blocked(f"SELECT reserve_event('{uuid.uuid4()}');"))
def concurrent_reservations():
 e=str(uuid.uuid4());query(f"INSERT INTO events(id,capacity) VALUES('{e}',1);")
 with concurrent.futures.ThreadPoolExecutor(max_workers=20) as pool:
  results=list(pool.map(lambda u:query(f"SELECT reserve_event('{e}');",u,check=False),users[:20]))
 assert sum(r.returncode==0 for r in results)==1
 assert query(f"SELECT count(*) FROM attendances WHERE event_id='{e}' AND status='registered';").stdout.strip()=='1'
 winner=users[next(i for i,r in enumerate(results) if r.returncode==0)]
 query(f"SELECT reserve_event('{e}');",winner)
 assert query(f"SELECT count(*) FROM attendances WHERE event_id='{e}';").stdout.strip()=='1'
test('20 simultaneous reservations: exactly one winner, repeated booking idempotent',concurrent_reservations)
def hide():
 query('SELECT hide_my_profile();',users[0]);r=query(f"SELECT full_name,is_anonymized,birth_date FROM profiles WHERE id='{users[0]}';")
 assert 'Perfil oculto|t|1990-01-01' in r.stdout
test('profile hiding preserves age and records consent atomically',hide)
def account_delete():
 u=users[21];query(f"INSERT INTO event_reviews(user_id) VALUES('{u}');")
 query(f"SELECT delete_account('{u}');",u)
 assert query(f"SELECT count(*) FROM auth.users WHERE id='{u}';").stdout.strip()=='0'
 assert query(f"SELECT count(*) FROM profiles WHERE id='{u}';").stdout.strip()=='0'
 assert query(f"SELECT count(*) FROM event_reviews WHERE user_id='{u}';").stdout.strip()=='0'
 blocked("INSERT INTO galleries(name) VALUES('deleted token');",u)
test('account deletion removes Auth and data; deleted identity cannot write',account_delete)
def rollback_delete():
 u=users[22];query(f"INSERT INTO storage.objects(owner_id,bucket_id) VALUES('{u}','galerias');")
 blocked(f"SELECT delete_account('{u}');",u)
 assert query(f"SELECT count(*) FROM profiles WHERE id='{u}';").stdout.strip()=='1'
 assert query(f"SELECT count(*) FROM auth.users WHERE id='{u}';").stdout.strip()=='1'
test('Storage ownership blocks deletion without data loss',rollback_delete)
def stale_auth():
 u=users[20]
 blocked(f"SET request.jwt.claims='{{}}'; SELECT delete_account('{u}');",u)
test('account deletion requires recent password authentication',stale_auth)
test('cannot delete another account',lambda:blocked(f"SELECT delete_account('{users[1]}');"))
def consent():
 u=str(uuid.uuid4()); metadata=json.dumps({'accepted_privacy':True,'privacy_policy_version':'privacidad-v3-2026-09'})
 query(f"INSERT INTO auth.users(id,email,raw_user_meta_data) VALUES('{u}','consent@example.com','{metadata}');")
 assert query(f"SELECT count(*) FROM consent_logs WHERE user_id='{u}';").stdout.strip()=='1'
test('signup trigger persists consent without a user session',consent)
def transaction_rollback():
 u=users[19]
 query("CREATE TABLE IF NOT EXISTS qa_restrict_user_fk (user_id uuid REFERENCES auth.users);")
 query(f"INSERT INTO qa_restrict_user_fk(user_id) VALUES('{u}'); INSERT INTO event_reviews(user_id) VALUES('{u}');")
 blocked(f"SELECT delete_account('{u}');",u)
 assert query(f"SELECT count(*) FROM profiles WHERE id='{u}';").stdout.strip()=='1'
 assert query(f"SELECT count(*) FROM event_reviews WHERE user_id='{u}';").stdout.strip()=='1'
test('unexpected FK error rolls back every account deletion step',transaction_rollback)
def whitelist_rollback():
 e=str(uuid.uuid4());query(f"INSERT INTO events(id,capacity) VALUES('{e}',1);")
 emails=','.join("'"+u+"@example.com'" for u in users[:2])
 blocked(f"SELECT add_event_whitelist('{e}',ARRAY[{emails}]);",admin)
 assert query(f"SELECT count(*) FROM attendances WHERE event_id='{e}';").stdout.strip()=='0'
test('whitelist exceeding capacity rolls back all registrations',whitelist_rollback)
print(json.dumps({'passed':len(passed),'failed':0,'tests':passed},indent=2))
