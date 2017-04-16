import React from 'react';

/**
 * TODOリスト・リスト部分
 */

export default function TodoList(props){
  const { todoList, updateTodo, deleteTodo } = props;

  if (!todoList.length) {
    return null;
  }
  return (
    <ul className="todoList jscTodoList">
      {todoList.map((list,index) =>
        <li
          key={list.timeStamp}
          className={list.isComplete ? "list completed" : "list"}
          data-list-index={index}
          onClick={updateTodo}
        >{list.text}<button className="removeBtn" onClick={deleteTodo} data-list-index={index}></button></li>
      )}
    </ul>
  )
}
