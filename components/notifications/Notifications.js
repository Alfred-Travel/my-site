import React, { useState } from 'react';
import { FaBell } from 'react-icons/fa';
import './Notifications.css';

const Notifications = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      itineraryNumber: 'IT-001',
      from: 'New York',
      to: 'Los Angeles',
      date: '2024-03-20',
      isRead: false,
    },
    {
      id: 2,
      itineraryNumber: 'IT-002',
      from: 'London',
      to: 'Paris',
      date: '2024-03-21',
      isRead: true,
    },
    {
      id: 3,
      itineraryNumber: 'IT-003',
      from: 'Tokyo',
      to: 'Seoul',
      date: '2024-03-22',
      isRead: false,
    },
  ]);

  const unreadCount = notifications.filter(notification => !notification.isRead).length;

  const toggleNotifications = () => {
    setIsOpen(!isOpen);
  };

  const markAsRead = (id) => {
    setNotifications(notifications.map(notification =>
      notification.id === id ? { ...notification, isRead: true } : notification
    ));
  };

  return (
    <div className="notifications-container">
      <div className="bell-icon" onClick={toggleNotifications}>
        <FaBell />
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </div>
      
      {isOpen && (
        <div className="notifications-dropdown">
          <div className="notifications-header">
            <h3>Notifications</h3>
          </div>
          <div className="notifications-list">
            {notifications.map(notification => (
              <div 
                key={notification.id} 
                className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                onClick={() => markAsRead(notification.id)}
              >
                {!notification.isRead && <div className="unread-dot" />}
                <div className="notification-content">
                  <div className="notification-title">
                    Itinerary {notification.itineraryNumber}
                  </div>
                  <div className="notification-details">
                    <span>{notification.from} → {notification.to}</span>
                    <span className="notification-date">{notification.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications; 