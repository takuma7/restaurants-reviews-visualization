# restaurants-reviews-visualization

This repository is a set of python scripts for gathering necessary data for [our restaurants visualization app](https://github.com/takuma7/restaurants-reviews-visualization-express )

# Usage

First of all, you need to create a file named `secret.yml` by doing:

```sh
cp secret.yml.example secret.yml
```

, and add you gnavi API keyid into it.

Then, execute commands below to gather necessary data. The execution order is important in order to collect data rightly.

```sh
python collect_restaurants_data.py
python collect_photo_for_rests.py
python add_review_info.py
python add_loc_column.py
```
