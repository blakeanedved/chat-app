import { Link } from "solid-app-router";
import { Component } from "solid-js";

import logo from "../assets/logo.svg";

const Home: Component = () => {
  return (
    <div>
      <header class='flex items-center justify-center flex-col text-white bg-gray-800 min-h-screen text-4xl'>
        <img
          src={logo}
          class='pointer-events-none animate-spin-slow mb-10'
          alt='logo'
          style={{ height: "40vmin" }}
        />
        <p class='p-5'>
          Edit <code>src/views/Home.tsx</code> and save to reload.
        </p>
        <a
          class='text-fuchsia-700 pb-3'
          href='https://github.com/solidjs/solid'
          target='_blank'
          rel='noopener noreferrer'
        >
          Learn Solid
        </a>
        <Link class='text-fuchsia-700' href='/about'>
          About
        </Link>
      </header>
    </div>
  );
};

export default Home;
