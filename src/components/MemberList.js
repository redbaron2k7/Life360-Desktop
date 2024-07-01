import React from 'react';
import { useSelector } from 'react-redux';
import MemberCard from './MemberCard';

function MemberList({ onMemberSelect }) {
  const { currentCircle } = useSelector((state) => state.circle);

  if (!currentCircle || !currentCircle.members) {
    return <div className="text-white">No member data available</div>;
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-white">Members</h2>
      <div className="space-y-4">
        {currentCircle.members.map((member) => (
          <div key={member.id} className="cursor-pointer" onClick={() => onMemberSelect(member.id)}>
            <MemberCard member={member} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default MemberList;