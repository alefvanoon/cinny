/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import initMatrix from '../../../client/initMatrix';
import { doesRoomHaveUnread } from '../../../util/matrixUtil';
import navigation from '../../../client/state/navigation';
import { openRoomOptions } from '../../../client/action/navigation';
import { createSpaceShortcut, deleteSpaceShortcut } from '../../../client/action/room';
import { getEventCords } from '../../../util/common';

import IconButton from '../../atoms/button/IconButton';
import RoomSelector from '../../molecules/room-selector/RoomSelector';

import HashIC from '../../../../public/res/ic/outlined/hash.svg';
import HashLockIC from '../../../../public/res/ic/outlined/hash-lock.svg';
import SpaceIC from '../../../../public/res/ic/outlined/space.svg';
import SpaceLockIC from '../../../../public/res/ic/outlined/space-lock.svg';
import StarIC from '../../../../public/res/ic/outlined/star.svg';
import FilledStarIC from '../../../../public/res/ic/filled/star.svg';
import VerticalMenuIC from '../../../../public/res/ic/outlined/vertical-menu.svg';

function Selector({
  roomId, isDM, drawerPostie, onClick,
}) {
  const mx = initMatrix.matrixClient;
  const room = mx.getRoom(roomId);
  let imageSrc = room.getAvatarFallbackMember()?.getAvatarUrl(mx.baseUrl, 24, 24, 'crop') || null;
  if (imageSrc === null) imageSrc = room.getAvatarUrl(mx.baseUrl, 24, 24, 'crop') || null;

  const [isSelected, setIsSelected] = useState(navigation.selectedRoomId === roomId);
  const [, forceUpdate] = useState({});

  function selectorChanged(selectedRoomId) {
    setIsSelected(selectedRoomId === roomId);
  }
  function changeNotificationBadge() {
    forceUpdate({});
  }

  useEffect(() => {
    drawerPostie.subscribe('selector-change', roomId, selectorChanged);
    drawerPostie.subscribe('unread-change', roomId, changeNotificationBadge);
    return () => {
      drawerPostie.unsubscribe('selector-change', roomId);
      drawerPostie.unsubscribe('unread-change', roomId);
    };
  }, []);

  if (room.isSpaceRoom()) {
    return (
      <RoomSelector
        key={roomId}
        name={room.name}
        roomId={roomId}
        iconSrc={room.getJoinRule() === 'invite' ? SpaceLockIC : SpaceIC}
        isUnread={doesRoomHaveUnread(room)}
        notificationCount={room.getUnreadNotificationCount('total') || 0}
        isAlert={room.getUnreadNotificationCount('highlight') !== 0}
        onClick={onClick}
        options={(
          <IconButton
            size="extra-small"
            variant={initMatrix.roomList.spaceShortcut.has(roomId) ? 'positive' : 'surface'}
            tooltip={initMatrix.roomList.spaceShortcut.has(roomId) ? 'Remove favourite' : 'Favourite'}
            tooltipPlacement="right"
            src={initMatrix.roomList.spaceShortcut.has(roomId) ? FilledStarIC : StarIC}
            onClick={() => {
              if (initMatrix.roomList.spaceShortcut.has(roomId)) deleteSpaceShortcut(roomId);
              else createSpaceShortcut(roomId);
              forceUpdate({});
            }}
          />
        )}
      />
    );
  }

  return (
    <RoomSelector
      key={roomId}
      name={room.name}
      roomId={roomId}
      imageSrc={isDM ? imageSrc : null}
      // eslint-disable-next-line no-nested-ternary
      iconSrc={isDM ? null : room.getJoinRule() === 'invite' ? HashLockIC : HashIC}
      isSelected={isSelected}
      isUnread={doesRoomHaveUnread(room)}
      notificationCount={room.getUnreadNotificationCount('total') || 0}
      isAlert={room.getUnreadNotificationCount('highlight') !== 0}
      onClick={onClick}
      options={(
        <IconButton
          size="extra-small"
          tooltip="Options"
          tooltipPlacement="right"
          src={VerticalMenuIC}
          onClick={(e) => openRoomOptions(getEventCords(e), roomId)}
        />
      )}
    />
  );
}

Selector.defaultProps = {
  isDM: true,
};

Selector.propTypes = {
  roomId: PropTypes.string.isRequired,
  isDM: PropTypes.bool,
  drawerPostie: PropTypes.shape({}).isRequired,
  onClick: PropTypes.func.isRequired,
};

export default Selector;
