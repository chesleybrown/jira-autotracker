jira-autotracker
================

An automated Jira time tracker. It automatically determines hours worked on a task by a given user based on if that task was assigned to the user and in a specific status during a day. For example, if Task A and Task B were being worked on (status = In Progress) by Ches on Day 1 then we assume Ches spent 4 hours on Task A and 4 hours on Task B. It is assumed he is working on these tasks each day until the task is moved back to "Open" or is "Resolved". Although not precise, it gives a very good indication of how long a task takes from getting started to being completed and how much dev time it takes to do so.

# Setup

1. `npm install`
2. Copy `.env.dist` to `.env`
3. Set the enviroment variables in `.env` to what you need

# Running

1. `grunt`
