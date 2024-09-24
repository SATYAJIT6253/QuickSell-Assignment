import React, { useState, useEffect } from "react";
import "./Home.css";
import svg from "../assets/react.svg";

const Home = () => {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);

  const [grouping, setGrouping] = useState(
    () => localStorage.getItem("grouping") || "Status"
  );
  const [ordering, setOrdering] = useState(
    () => localStorage.getItem("ordering") || "Priority"
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const [draggedTicket, setDraggedTicket] = useState(null);

  useEffect(() => {
    fetch("https://api.quicksell.co/v1/internal/frontend-assignment")
      .then((response) => response.json())
      .then((data) => {
        setTickets(data.tickets);
        setUsers(data.users);
      })
      .catch((error) => console.log("Error fetching data :", error));
  }, []);

  useEffect(() => {
    localStorage.setItem("grouping", grouping);
  }, [grouping]);

  useEffect(() => {
    localStorage.setItem("ordering", ordering);
  }, [ordering]);

  const groupTickets = (tickets) => {
    switch (grouping) {
      case "User":
        return groupByUser(tickets, users);
      case "Priority":
        return groupByPriority(tickets);
      case "Status":
      default:
        return groupByStatus(tickets);
    }
  };

  const sortTickets = (tickets) => {
    switch (ordering) {
      case "Title":
        return tickets.sort((a, b) => a.title.localeCompare(b.title));
      case "Priority":
      default:
        return tickets.sort((a, b) => b.priority - a.priority);
    }
  };

  const groupByStatus = (tickets) => {
    return {
      Backlog: tickets.filter((ticket) => ticket.status === "Backlog"),
      Todo: tickets.filter((ticket) => ticket.status === "Todo"),
      InProgress: tickets.filter((ticket) => ticket.status === "In progress"),
      Done: tickets.filter((ticket) => ticket.status === "Done"),
      Canceled: tickets.filter((ticket) => ticket.status === "Canceled"),
    };
  };

  const groupByUser = (tickets, users) => {
    const groupedByUser = {};

    users.forEach((user) => {
      groupedByUser[user.name] = tickets.filter(
        (ticket) => ticket.userId === user.id
      );
    });
    return groupedByUser;
  };

  const groupByPriority = (tickets) => {
    return {
      NoPriority: tickets.filter((ticket) => ticket.priority === 0),
      Urgent: tickets.filter((ticket) => ticket.priority === 4),
      High: tickets.filter((ticket) => ticket.priority === 3),
      Medium: tickets.filter((ticket) => ticket.priority === 2),
      Low: tickets.filter((ticket) => ticket.priority === 1),
    };
  };

  const handleDrop = (newStatus, ticketId) => {
    setTickets((prevTickets) =>
      prevTickets.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, status: newStatus } : ticket
      )
    );
    setDraggedTicket(null);
  };

  const groupedTickets = groupTickets(sortTickets(tickets));

  return (
    <div className="home-container">
      <div className="icon-dropdown">
        <span
          onClick={() => setShowDropdown(!showDropdown)}
          className="dropdown-trigger"
        >
          Display &#709;
        </span>
        {showDropdown && (
          <div className="dropdown-menu">
            <div className="dropdown-row">
              <div className="dropdown-grouping">
                <label>Grouping</label>
                <select
                  value={grouping}
                  onChange={(e) => setGrouping(e.target.value)}
                  className="dropdown-select"
                >
                  <option value="Status">Status</option>
                  <option value="User">User</option>
                  <option value="Priority">Priority</option>
                </select>
              </div>

              <div className="dropdown-ordering">
                <label>Ordering</label>
                <select
                  value={ordering}
                  onChange={(e) => setOrdering(e.target.value)}
                  className="dropdown-select"
                >
                  <option value="Priority">Priority</option>
                  <option value="Title">Title</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="kanban-board">
        {Object.keys(groupedTickets).map((group) => (
          <KanbanColumn
            key={group}
            title={group}
            tickets={groupedTickets[group]}
            users={users}
            onDropCard={handleDrop}
            setDraggedTicket={setDraggedTicket}
            draggedTicket={draggedTicket}
          />
        ))}
      </div>
    </div>
  );
};

const KanbanColumn = ({
  title,
  tickets,
  users,
  onDropCard,
  setDraggedTicket,
  draggedTicket,
}) => {
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (draggedTicket) {
      onDropCard(title, draggedTicket.id);
    }
  };

  return (
    <div
      className="kanban-column"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <h3>{title}</h3>
      {tickets.length > 0 ? (
        tickets.map((ticket) => (
          <KanbanCard
            key={ticket.id}
            ticket={ticket}
            users={users}
            setDraggedTicket={setDraggedTicket}
          />
        ))
      ) : (
        <p>No tickets</p>
      )}
    </div>
  );
};

const KanbanCard = ({ ticket, users, setDraggedTicket }) => {
  const handleDragStart = () => {
    setDraggedTicket(ticket);
  };

  return (
    <div className="kanban-card" draggable onDragStart={handleDragStart}>
      <div className="card-header">
        <span className="ticket-id">{ticket.id}</span>
        <img src={svg} alt="userImg" className="assignee-avatar" />
      </div>
      <h4 className="ticket-title">{ticket.title}</h4>
      <div className="card-tags">
        <span className="priority-icon">{ticket.priority}</span>
        <span className="ticket-tag">{ticket.tag}</span>
      </div>
    </div>
  );
};

export default Home;
