import React from 'react';
import { generateAvatar } from '../utils/avatarGenerator';

function MemberCard({ member }) {
  const avatarUrl = member.avatar || generateAvatar(member.firstName);

  return (
    <div className="bg-gray-700 rounded-lg p-4 flex items-center space-x-4">
      <img
        src={avatarUrl}
        alt={`${member.firstName} ${member.lastName}`}
        className="w-12 h-12 rounded-full"
      />
      <div>
        <h3 className="text-lg font-semibold text-white">{`${member.firstName} ${member.lastName}`}</h3>
        <p className="text-gray-300">{member.location?.name || (member.location?.address1 ? `${member.location.address1} ${member.location.address2 || ''}`.trim() : member.location?.address2) || 'Unknown location'} </p>
        <p className="text-gray-400 text-sm">
          Battery: {member.location?.battery || 'N/A'}%
          {member.location?.charge === '1' && ' (Charging)'}
        </p>
      </div>
    </div>
  );
}

export default MemberCard;