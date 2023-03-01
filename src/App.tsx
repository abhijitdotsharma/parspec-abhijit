import { useState, useEffect, useRef, ChangeEvent } from "react";
import "./App.css";



type User = {
  id: string,
  name: string,
  address: string,
  pincode: string,
  items: string[],
  foundItem?: string,
}

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredList, setFilteredList] = useState<User[]>([]);

  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const userListRef = useRef<HTMLUListElement>(null);


  useEffect(() => {
    fetch("http://www.mocky.io/v2/5ba8efb23100007200c2750c")
      .then((res) => res.json())
      .then((json) => {
        setUsers(json);
      }).catch(err => {
        console.log(`error from server: ${err}`)
      });
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [highlightedIndex]);

  //focus clicked card
  const handleCardClick = (index: number) => {
    setHighlightedIndex(index);
    
    userListRef.current?.children[index]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "center"
    });
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      const direction = event.key === "ArrowUp" ? -1 : 1;
      const lastIndex = filteredList.length - 1;
      const nextIndex =
        (highlightedIndex === null ? -1 : highlightedIndex) + direction;
      const index =
        nextIndex < 0 ? lastIndex : nextIndex > lastIndex ? 0 : nextIndex;
      setHighlightedIndex(index);
      userListRef.current?.children[index]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center"
      });
    }
  };

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const originalSearchValue = e.target.value;
    const searchValue = originalSearchValue.toLowerCase();

    setSearchQuery(originalSearchValue); 
    setHighlightedIndex(null);

    const filteredUsers = users.filter((user) => {

      // can be extracted to a function for better modularity
      return (
        user.name.toLowerCase().includes(searchValue) ||
        user.id.toLowerCase().includes(searchValue) ||
        user.address.toLowerCase().includes(searchValue) ||
        user.pincode.toLowerCase().includes(searchValue) ||
        user.items.some((item) => {
          // if searchValue in items
          // update current user object and return to filteredUsers
          if (item.toLowerCase().includes(searchValue)) {
            user.foundItem = originalSearchValue;
          } else {
            delete user.foundItem;
          }

          return item.toLowerCase().includes(searchValue);
        })
      );
    });

    setFilteredList(filteredUsers);
  };

  const splitResult = (result: string) =>
    //Split on search result and then simply style the matches
    result.split(new RegExp(`(${searchQuery})`, `gi`)).map((piece, index) => {
      return (
        <span
          key={index}
          style={{
            background:
              piece.toLowerCase() === searchQuery.toLocaleLowerCase()
                ? "YELLOW"
                : "TRANSPARENT"
          }}
        >
          {piece}
        </span>
      );
    });

    console.log(filteredList)

  return (
    <div className="App">
      <div className="main">
        <div className="input-div">
          <input onChange={handleSearch} type="text" />
        </div>


        {searchQuery.length !== 0 && filteredList.length === 0 && (
          <p>No card found</p>
        )}
        

        {searchQuery.length !== 0 && filteredList.length > 0 && (
        <ul className="content-div" ref={userListRef}>
          {filteredList.map((item, index) => (
            <li
              key={item.id}
              className={`LI ${
                highlightedIndex === index ? "focussed" : "not-focussed"
              }`}
              onClick={() => handleCardClick(index)}
              onMouseEnter={() => setHighlightedIndex(index)}
              onMouseLeave={() => setHighlightedIndex(null)}
            >
              <p>{splitResult(item.id)}</p>
              <p>{splitResult(item.name)}</p>
              {item.foundItem && 
                <p>
                  <small>{splitResult(item.foundItem)} <span>found in items</span></small>  
                </p>
              }
              <p>{splitResult(item.address)}</p>
              <p>{splitResult(item.pincode)}</p>
            </li>
          ))}
        </ul>)}

      </div>
    </div>
  );
}

export default App;





// {searchQuery.length !== 0 && filteredList.length === 0 ? (
//   <div>No Card Found</div>
// ) : 
// (<ul className="content-div" ref={userListRef}>)
// This doesn't hide the list, on deletion when filteredList is full

