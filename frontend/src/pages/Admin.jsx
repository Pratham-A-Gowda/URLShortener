import React, { useEffect, useState } from 'react'
import { useApi } from '../context/ApiContext'
import { useAuth } from '../context/AuthContext'

export default function Admin(){
  const api = useApi(); const { token } = useAuth()
  const [users,setUsers] = useState([])
  const load = ()=> api.get('/api/admin/users',{ headers:{ Authorization:'Bearer '+token } }).then(r=>setUsers(r.data.users))
  useEffect(()=>{ if(token) load() },[token])
  const promote = (id)=> api.post('/api/admin/users/'+id+'/promote',{}, { headers:{ Authorization:'Bearer '+token } }).then(load)
  const demote = (id)=> api.post('/api/admin/users/'+id+'/demote',{}, { headers:{ Authorization:'Bearer '+token } }).then(load)
  const remove = (id)=> api.delete('/api/admin/users/'+id, { headers:{ Authorization:'Bearer '+token } }).then(load)
  return (
    <div className="app-panel">
      <h2 className="panel-title">Admin Panel</h2>
      <table className="table" style={{width:'100%'}}>
        <thead><tr><th>Email</th><th>Admin</th><th>Actions</th></tr></thead>
        <tbody>
          {users.map(u=> (
            <tr key={u.id}>
              <td>{u.email}</td>
              <td>{u.is_admin ? 'Yes' : 'No'}</td>
              <td>
                <div style={{display:'flex',gap:8}}>
                  {!u.is_admin && <button className="btn small" onClick={()=>promote(u.id)}>Promote</button>}
                  {u.is_admin && <button className="btn small" onClick={()=>demote(u.id)}>Demote</button>}
                  <button onClick={()=>remove(u.id)} className="small" style={{color:'#ff6b6b'}}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
