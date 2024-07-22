# Secure Real Time Chat Application using RSA, AES and HMAC
<h3>
  This project aims to create a real time chat application that implements 3 algorithms, Rivest, Shamir and Adleman (RSA), Advanced Ecryption System (AES) and Hash Hash-based Message Authentication Code (HMAC). </h3>
  <br> 
  <p> RSA and AES has been implemented through a concept called Hybrid cryptogtaphy which works to decrypt and encrypt the message.
  <br> Meanwhile HMAC is used to test the integrity of the message.
    <br> This application allows users to send text, image, and audio messages to their contacts in real-time. It includes features like user authentication, contact management, real-time messaging using Socket.IO, and video and voice call support.
  </p><br>

  <h3>Tech Stack</h3>
  <hr>
  <ul>
    <li>
      <b>Frontend:</b> React.js, Tailwind CSS, Socket.IO-client, etc.
    </li>
    <li>
      <b>Backend:</b> Node.js, Express.js, Prisma ORM, Socket.IO, etc.
    </li>
    <li>
      <b>Database:</b> PostgreSQL
    </li>
  </ul>

<h3>Installation</h3>
<hr>
<ol>
  <li>
    <strong>Clone the repository:</strong>
    <pre><code>git clone https://github.com/flexie0o0/secure-real-time-chat-application.git </code></pre>
  </li>
  
  <li>
    <strong>Install dependencies for frontend and backend:</strong>
    <pre><code>cd whatsup/frontend
npm install

cd ../backend
npm install</code></pre>
  </li>
  
  <li>
    <strong>Set up environment variables:</strong>
    <p>Create a <code>.env</code> file in the backend folder with the following variables:</p>
    <pre><code>PORT=port_number
DATABASE_URL=your_postgresql_database_url
ZEGO_APP_ID=your_zego_app_id
ZEGO_SERVER_ID=your_zego_server_id</code></pre>
  </li>
  
  <li>
    <strong>Start the frontend and backend servers:</strong>
    <p>Frontend:</p>
    <pre><code>cd frontend
npm start</code></pre>
    <p>Backend:</p>
    <pre><code>cd backend
npm start</code></pre>
  </li>
</ol>

<p>Your application should now be running on <a href="http://localhost:3000">http://localhost:3000</a>.</p>


