# Problem 1

1. Often our partners provide us data as CSVs. What are the benefits and challenges that exist with using CSVs as a serialization mechanism?

2. What optimizations, if any, would you use if there were around 1 million cross references provided? Assume that an end user is waiting on the results. There is no need to write code for this answer.

# Problem 2

Please do not write any additional code! Your API should meet the specification described above.

1. Do you have anything you would like to explain about your solution?

2. Imagine that we have a SPA frontend (such as React). All information about the case groups from problem 1 is stored in a spreadsheet-like UI component, where each row represents a case group. You can imagine that each row / group is a separate component that is only re-rendered when the group’s data changes. One issue is that the /link and /unlink operations can mutate multiple groups.

    1. What are some high-level ways that ensure the frontend SPA stays up-to-date given that multiple groups change on the backend?

    2. What changes would you make to the API and/or frontend in order to implement this fix?

3. Assume that we now want to serve this API on a single-process multi-threaded web server. What would you need to change in order for your API to accept concurrent requests? We understand that this answer may vary depending on the semantics of your chosen language and your choice of data store. If the answer is “Nothing needs to be changed”, please explain why.

4. Are there other design changes you would make to the API and/or frontend based on the problem description and these follow up questions? Feel free to indicate your personal preferences.

# Problem 3

1. Please describe your solution, including any assumptions you made

2. Assume we chose to create SQL tables for CaseGroup and Case in order to store this information in our application’s PostgreSQL OLTP storage. How might you extend the schema to store the new analytic information?
