'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Tag {
  id: string;
  name: string;
  color: string;
}

export default function TagsPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTags(){
      try{
        const res=await fetch('/api/tags');
        if(!res.ok) throw new Error('Failed to load tags');
        setTags(await res.json());
      }catch(e){console.error(e);}finally{setLoading(false);}
    }
    fetchTags();
  },[]);

  const handleDelete=(id:string)=>async()=>{
    if(!confirm('Delete tag?')) return;
    await fetch('/api/tags', {method:'DELETE',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})});
    setTags(tags.filter(t=>t.id!==id));
  };

  return(
    <div>
      <h2 className="text-2xl font-semibold mb-4">Tag Management</h2>
      <Link href="/admin/tags/new" className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 mb-6">Add Tag</Link>

      {loading? <p>Loading tags…</p>:
        tags.length===0?<p>No tags yet.</p>:(
          <table className="min-w-full bg-white border border-gray-200">
            <thead><tr><th className="px-4 py-2">Name</th><th className="px-4 py-2">Color</th><th className="px-4 py-2">Actions</th></tr></thead>
            <tbody>{tags.map(t=>(
              <tr key={t.id} className="border-t">
                <td className="px-4 py-2">{t.name}</td>
                <td className="px-4 py-2"><span style={{backgroundColor:t.color}} className="inline-block w-6 h-6 rounded-full"></span> {t.color}</td>
                <td className="px-4 py-2">
                  <button onClick={handleDelete(t.id)} className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            ))}</tbody>
          </table>
        )}
    </div>
  );
}
