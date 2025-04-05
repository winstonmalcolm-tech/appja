import React from 'react'
import {format} from 'date-fns';

const CommentCard = ({ review }) => {

  return (
    <div className='w-full mb-8 border-b-[1px] border-gray-500'>
        <div className='flex justify-between items-center'>
            <div className='flex gap-4 items-center mb-5'>
            <div className='h-12 w-12 flex justify-center items-start bg-gradient-to-r from-custom-purple to-off-purple rounded-full'>
                {!review.profile_image ? <h1 className='flex justify-center items-center h-full w-full text-lg'>{review.first_name.charAt(0).toUpperCase()}{review.last_name.charAt(0).toUpperCase()}</h1> : <img className='w-full h-full object-cover object-top rounded-full' src={review.profile_image}/>}
            </div>
            <h1 className='text-lg'>{!review.username ? "Unknown" : review.username}</h1>
            </div>

            <h1 className='text-gray-400'>Posted {format(new Date(review.review_date), "MM/dd/yyyy")}</h1>

        </div>
        
        <p className='mb-2'>{review.review_text}</p>
    </div>
  )
}

export default CommentCard