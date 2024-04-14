import React, { useState, useEffect } from "react";
import "./TaskList.css";
import RedTrashCanIcon from "./red-trash-can-icon.svg"; 



const TaskList = () => {
    const [tasks, setTasks] = useState([]);
    const [taskType, setTaskType] = useState("pending"); // always load up pending tasks first
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [editedTaskTitle, setEditedTaskTitle] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [editedTaskId, setEditedTaskId] = useState(null);

    // refetch tasks when taskType changes
    useEffect(() => {
        fetchTasks(taskType);
    }, [taskType]);

    // Fetch tasks from the server
    const fetchTasks = (type) => {
        fetch(`http://localhost:3000/tasks/${type}`)
            .then((res) => res.json())
            .then((data) => {
                setTasks(data);
            })
            .catch((error) => console.error("Error fetching tasks:", error));
    };

    // Add a new task using post request and update the task list without refteching using response
    const handleTaskSubmit = (e) => {
        e.preventDefault();
        fetch(`http://localhost:3000/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title: newTaskTitle })
        })
        .then(response => response.json())
        .then(newTask => {
            setTasks([...tasks, newTask]);
            setNewTaskTitle(""); // Clear the input field after adding the task
        })
        .catch(error => console.error("Error adding task:", error));
    };

    // Update the task status using put request and update the task list without refetching using response
    const changeTaskStatus = (taskId, currentStatus) => {
        const newStatus = currentStatus === "pending" ? "completed" : "pending";
        fetch(`http://localhost:3000/tasks/${taskId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        })
        .then(response => response.json())
        .then(updatedTask => {
            // Update the task list with the updated task
            setTasks(tasks.map(task => task.id === taskId ? updatedTask : task));
            console.log(updatedTask)
        })
        .catch(error => console.error("Error updating task status:", error));
    };

    // Delete a task using delete request and update the task list without refetching
    const handleDeleteTask = (taskId) => {
        fetch(`http://localhost:3000/tasks/${taskId}`, {
            method: 'DELETE'
        })
        .then(() => {
            setTasks(tasks.filter(task => task.id !== taskId));
        })
        .catch(error => console.error("Error deleting task:", error));
    };

    // Update the task title using put request and update the task list without refetching using response
    const handleTaskEdit = (taskId, newTitle) => {
        setEditedTaskId(taskId);
        setEditedTaskTitle(newTitle);

        fetch(`http://localhost:3000/tasks/${taskId}/title`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title: newTitle })
        })
        .then(response => response.json())
        .then(updatedTask => {
            // Update the task list with the updated task
            setTasks(tasks.map(task => task.id === taskId ? updatedTask : task));
        })
        .catch(error => console.error("Error updating task title:", error));
    };


    return (
        <div>
            <div>
                <button onClick={() => setTaskType("")}>All Tasks</button>
                <button onClick={() => setTaskType("pending")}>Pending Tasks</button>
                <button onClick={() => setTaskType("completed")}>Completed Tasks</button>
            </div>

            <h2>{taskType === "" ? "All Tasks" : taskType === "pending" ? "Pending Tasks" : "Completed Tasks"}</h2>
            <ul>
                {tasks.map((task) => (
                    <li key={task.id} className="task-item">
                        <input
                            type="checkbox"
                            checked={task.status === "completed"}
                            onChange={() => changeTaskStatus(task.id, task.status)}
                        />

                        {/* if editing show input field, edit by clicking on the task title */}
                        {/* else we show general list */}
                        {isEditing && editedTaskId === task.id ? (
                            <input
                                type="text"
                                value={editedTaskTitle}
                                onChange={(e) => setEditedTaskTitle(e.target.value)}
                                onBlur={() => {
                                    handleTaskEdit(task.id, editedTaskTitle);
                                    setIsEditing(false);
                                }
                                }
                            />
                            // on blur because we want to save the task when we click out of the input field
                        ) : (
                            <span style={{ textDecoration: task.status === "completed" ? "line-through" : "none" }} 
                            onClick={() => { setEditedTaskId(task.id); setIsEditing(true); setEditedTaskTitle(task.title)}}>
                                {task.title}
                            </span>

                        )}
                        <img
                            src={RedTrashCanIcon}
                            alt="Delete Task"
                            className="delete-icon"
                            onClick={() => handleDeleteTask(task.id)}
                        />

                    </li>
                ))}
            </ul>

            <h3>Add a New Task</h3>

            <form onSubmit={handleTaskSubmit}>
                <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Enter task title"
                />
                <button type="submit">Add Task</button>
            </form>
        </div>
    );
}

export default TaskList;




