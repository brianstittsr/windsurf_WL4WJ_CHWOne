'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function NewTagPage(){
  const [name,setName]=useState('');
  const [color,setColor]=useState('#cccccc');
  const [submitting,setSubmitting]=useState(false);

  async function handleSubmit(e:React.FormEvent){
    e.preventDefault();
    setSubmitting(true);
    try{
      await fetch('/api/tags',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,color})});
      window.location.href='/admin/tags';
    }catch(err){console.error(err);}finally{setSubmitting(false);}
  }

  return(
    <div>
      <h2 className='text-2xl font-semibold mb-4'>Add New Tag</h2>
      <form onSubmit={handleSubmit} className='max-w-xl space-y-4'>
        <div>
          <label className='block text-sm font-medium'>Tag Name *</label>
          <input type='text' required value={name} onChange={e=>setName(e.target.value)} className='mt-1 block w-full rounded border-gray-300 p-2'/>
        </div>
        <div>
          <label className='block text-sm font-medium'>Color *</label>
          <input type='color' required value={color} onChange={e=>setColor(e.target.value)} className='mt-1 block w-full rounded border-gray-300 p-2'/>
        </div>
        <button type='submit' disabled={submitting} className='inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'>
          {submitting?'Saving…':'Save Tag'}
        </button>
      </form>
    </div>
  );
}
