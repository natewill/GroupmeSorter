//autocomplete
document.getElementById('autocomplete').addEventListener('input', function() {
    var input = this.value;
    if (input.length > 0) {
        fetch(`/autocomplete?q=${encodeURIComponent(input)}`)
            .then(response => response.json())
            .then(data => { 
                const suggestionsList = document.getElementById('suggestions');
                suggestionsList.innerHTML = ''; // Clear previous suggestions
                data.forEach(item => {
                    const li = document.createElement('li');
                    li.textContent = item;
                    suggestionsList.appendChild(li);
                });
            })
            .catch(error => console.error('Error fetching suggestions:', error));
    } else {
        document.getElementById('suggestions').innerHTML = ''; // Clear suggestions if input is empty
    }
});

document.getElementById('authorName').addEventListener('input', function() {
    const inputElement = this; // Store reference to the input element
    const input = this.value;
    if (input.length > 0) {
        fetch(`/autocomplete?q=${encodeURIComponent(input)}`)
            .then(response => response.json())
            .then(data => {
                const suggestionsList = document.getElementById('suggestions');
                suggestionsList.innerHTML = ''; // Clear previous suggestions
                data.forEach(item => {
                    const li = document.createElement('li');
                    li.textContent = item;
                    li.style.cursor = 'pointer'; // Make it look clickable
                    li.onclick = function() {
                        inputElement.value = this.textContent; // Set input value to clicked suggestion
                        suggestionsList.innerHTML = ''; // Clear suggestions after selection
                        // Optional: Automatically submit the form after selection
                        // document.getElementById('searchForm').submit();
                    };
                    suggestionsList.appendChild(li);
                });
            })
            .catch(error => console.error('Error fetching suggestions:', error));
    } else {
        document.getElementById('suggestions').innerHTML = ''; // Clear suggestions if input is empty
    }
});

//highlight search text
function addSearchTextToUrl() {
    const searchText = document.getElementById('searchText').value;
    const form = document.querySelector('form');
    const url = new URL(form.action, window.location.origin);
    url.searchParams.set('searchText', searchText);
    form.action = url.toString();
  }

  const searchText = '<%= searchText %>';
  const resultElements = document.querySelectorAll('.result-content p');

  resultElements.forEach(resultElement => {
    const text = resultElement.textContent;
    const highlightedText = text.replace(new RegExp(searchText, 'gi'), `<span class="highlight">$&</span>`);
    resultElement.innerHTML = highlightedText;
  });