const collection = [
  {
      id: 'cityscapes',
      name: 'Cityscapes'   
  },
  {
      id: 'impressionism',
      name: 'Impressionism' 
  },
  {
      id: 'animals',
      name: 'Animals'  
  },
  {
      id: 'essentials',
      name: 'Essentials' 
  },
  {
      id: 'africandiaspora',
      name: 'African Diaspora'
  },
  {
      id: 'fashion',
      name: 'Fashion'
  },
  {
      id: 'chicagoartists',
      name: 'Chicago Artists'
  },
  {   id: 'popart',
      name: 'Pop Art'
  }
]

const Pagination = ({ items, pageSize, onPageChange }) => {
  const { Button } = ReactBootstrap;
  if (items.length <= 1) return null;

  let num = Math.ceil(items.length / pageSize);
  let pages = range(1, num + 1);
  const list = pages.map(page => {
    return (
      <Button className="page-link" variant="secondary" key={page} onClick={onPageChange}>
        {page}
      </Button>
    );
  });
  return (
    <nav>
      <ul className="pagination">{list}</ul>
    </nav>
  );
};
const range = (start, end) => {
  return Array(end - start + 1)
    .fill(0)
    .map((item, i) => start + i);
};
function paginate(items, pageNumber, pageSize) {
  const start = (pageNumber - 1) * pageSize;
  let page = items.slice(start, start + pageSize);
  return page;
}
const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState(initialUrl);

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData
  });

  useEffect(() => {
    let didCancel = false;
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      try {
        const result = await axios(url);
        if (!didCancel) {
          dispatch({ type: "FETCH_SUCCESS", payload: result.data });
        }
      } catch (error) {
        if (!didCancel) {
          dispatch({ type: "FETCH_FAILURE" });
        }
      }
    };
    fetchData();
    return () => {
      didCancel = true;
    };
  }, [url]);
  return [state, setUrl];
};
const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true
      };
    default:
      throw new Error();
  }
};
// App that gets data from Hacker News url
function App() {
  const { Fragment, useState, useEffect, useReducer } = React;
  const [query, setQuery] = useState("cityscapes");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 1;
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    "https://api.artic.edu/api/v1/artworks/search?q=cityscapes&&fields=id,title,image_id,date_display",
    {
      data: []
    }
  );
  const handlePageChange = e => {
    setCurrentPage(Number(e.target.textContent));
  };
  let page = data.data;
  if (page.length >= 1) {
    page = paginate(page, currentPage, pageSize);
    console.log(`currentPage: ${currentPage}`);
  }
  
  
  const handleSelect = (e) => {
    //new query search
    doFetch(`https://api.artic.edu/api/v1/artworks/search?q=${e.target.value}&&fields=id,title,image_id,date_display`);
    setCurrentPage(1);
  }
  
  return (
    <Fragment>
      <form id="select-artist">
        <label>Choose A Category</label>
          <select onChange={(e) => handleSelect(e)}>
            {collection.map(({ id, name }) => (
              <option key={id} value={id}>{name}</option>
                ))}
          </select>
      </form>
      {isLoading ? (
        <div>Loading ...</div>
          ) : (
            <ul>
              {page.map(({ id, title, image_id, date_display }) => (
                <li key={id} className="list-item">
                  <div className="image-wrapper">
                  <a href={`https://www.artic.edu/artworks/${id}`}><h2>{title}</h2></a>
                  <a href={`https://www.artic.edu/artworks/${id}`}><h3>Date: {date_display}</h3 ></a>  
                  </div>
                  <div>
                      <img
                        src={`https://www.artic.edu/iiif/2/${image_id}/full/400,/0/default.jpg`}
                        alt={title} />
                  </div>

                </li>
              ))}
            </ul>
      )}
      <Pagination
        items={data.data}
        pageSize={pageSize}
        onPageChange={handlePageChange}
      ></Pagination>
    </Fragment>
  );
}

// ========================================
ReactDOM.render(<App />, document.getElementById("root"));
