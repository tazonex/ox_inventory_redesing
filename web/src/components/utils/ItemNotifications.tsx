import React, { useContext, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { TransitionGroup } from 'react-transition-group';
import useNuiEvent from '../../hooks/useNuiEvent';
import useQueue from '../../hooks/useQueue';
import { Locale } from '../../store/locale';
import { getItemUrl } from '../../helpers';
import { SlotWithItem } from '../../typings';
import { Items } from '../../store/items';
import Fade from './transitions/Fade';
import { getNotifyPosition, subscribeNotifyPosition, stacksUpward, NotifyPosition } from '../../helpers/notifyPosition';

interface ItemNotificationProps {
  item: SlotWithItem;
  text: string;
}

export const ItemNotificationsContext = React.createContext<{
  add: (item: ItemNotificationProps) => void;
} | null>(null);

export const useItemNotifications = () => {
  const itemNotificationsContext = useContext(ItemNotificationsContext);
  if (!itemNotificationsContext) throw new Error(`ItemNotificationsContext undefined`);
  return itemNotificationsContext;
};

const ItemNotification = React.forwardRef(
  (props: { item: ItemNotificationProps; style?: React.CSSProperties }, ref: React.ForwardedRef<HTMLDivElement>) => {
    const slotItem = props.item.item;
    const itemLabel = slotItem.metadata?.label || Items[slotItem.name]?.label || slotItem.name;

    return (
      <div className="item-notification-box" style={props.style} ref={ref}>
        {/* Action badge */}
        <div className="item-notification-action">
          <span>{props.item.text}</span>
        </div>

        {/* Item image */}
        <div className="item-notification-image-wrapper">
          <img
            src={getItemUrl(slotItem)}
            alt={slotItem.name}
            className="item-notification-image"
            draggable={false}
          />
        </div>

        {/* Item label */}
        <div className="item-notification-label">
          {itemLabel}
        </div>
      </div>
    );
  }
);

// Position styles moved to index.scss and applied via class names

export const ItemNotificationsProvider = ({ children }: { children: React.ReactNode }) => {
  const [position, setPosition] = useState<NotifyPosition>(getNotifyPosition);

  useEffect(() => {
    return subscribeNotifyPosition(setPosition);
  }, []);

  const queue = useQueue<{
    id: number;
    item: ItemNotificationProps;
    ref: React.RefObject<HTMLDivElement>;
  }>();

  const add = (item: ItemNotificationProps) => {
    const ref = React.createRef<HTMLDivElement>();
    const notification = { id: Date.now(), item, ref: ref };

    queue.add(notification);

    const timeout = setTimeout(() => {
      queue.remove();
      clearTimeout(timeout);
    }, 2500);
  };

  useNuiEvent<[item: SlotWithItem, text: string, count?: number]>('itemNotify', ([item, text, count]) => {
    add({ item: item, text: count ? `${Locale[text]} ${count}x` : `${Locale[text]}` });
  });

  const upward = stacksUpward(position);

  return (
    <ItemNotificationsContext.Provider value={{ add }}>
      {children}
      {createPortal(
        <TransitionGroup
          className={`item-notification-container notify-pos-${position}${upward ? ' item-notification-container--upward' : ''}`}
        >
          {queue.values.map((notification, index) => (
            <Fade key={`item-notification-${index}`}>
              <ItemNotification item={notification.item} ref={notification.ref} />
            </Fade>
          ))}
        </TransitionGroup>,
        document.body
      )}
    </ItemNotificationsContext.Provider>
  );
};
