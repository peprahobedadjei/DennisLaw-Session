import React, { useState, useEffect } from 'react';
import "./App.css";
import msgIcon from "./assets/message.svg";
import deleteIcon from "./assets/delete-svgrepo-com.svg";
import refreshIcon from "./assets/refresh-svgrepo-com.svg";

function Sidebar({ handleSessionClick }) {
  const [sessions, setSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [deletingSessionId, setDeletingSessionId] = useState(null); // Track which session is being deleted

  const fetchSessions = async () => {
    setSessionsLoading(true);
    try {
      const userauth = JSON.parse(localStorage.getItem('userauth'));
      const userPseudoId = userauth?.user_pseudo_id;

      if (!userPseudoId) {
        alert("User is not authenticated");
        return;
      }

      const response = await fetch(`https://dennislaw-session-xr6xja66ya-uk.a.run.app/sessions/?userPseudoId=${userPseudoId}`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setSessions(data);
        } else {
          console.error("Invalid sessions data received:", data);
          setSessions([]);
        }
      } else {
        alert("Failed to fetch sessions");
        setSessions([]);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
      setSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleDeleteSession = async (id) => {
    setDeletingSessionId(id); // Set the session as being deleted

    try {
      const response = await fetch(`https://dennislaw-session-xr6xja66ya-uk.a.run.app/delete/?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSessions(sessions.filter(session => session.name !== id));
      } else {
        alert("Failed to delete session");
      }
    } catch (error) {
      console.error("Error deleting session:", error);
    } finally {
      setDeletingSessionId(null); // Reset the deleting state
    }
  };

  return (
    <div className="upperSideBottom">
      <div className="session-header">
        <div className="session-title">Sessions</div>
        <img 
          src={refreshIcon} 
          alt="Refresh sessions" 
          className="refresh-icon" 
          onClick={fetchSessions} 
        />
      </div>
      {sessionsLoading ? (
        <div className="session-loader"></div>
      ) : (
        <div className="session-list">
          {sessions.length === 0 ? (
            <div className="no-history">No History</div>
          ) : (
            sessions.map((session, index) => {
              const sessionName = session.turns?.[0]?.query?.text || 'Untitled';
              const displayName = sessionName.length > 19 ? sessionName.slice(0, 19) + '...' : sessionName;

              const isDeleting = deletingSessionId === session.name;

              return (
                <div key={index} className={`session-item ${isDeleting ? 'disabled' : ''}`}>
                  <button 
                    className="query" 
                    onClick={() => handleSessionClick(session.name)}
                    disabled={isDeleting} // Disable the button while deleting
                  >
                    <img src={msgIcon} alt="query" />
                    {displayName}
                  </button>
                  <img 
                    src={isDeleting ? refreshIcon : deleteIcon} // Change icon to refresh while deleting
                    alt={isDeleting ? "Deleting..." : "Delete session"} 
                    className={`delete-icon ${isDeleting ? 'rotating' : ''}`} // Optional rotating effect
                    onClick={() => !isDeleting && handleDeleteSession(session.name)} // Disable click while deleting
                  />
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default Sidebar;
