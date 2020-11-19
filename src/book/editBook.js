import React from 'react';
import { View, TextInput, SafeAreaView, ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import { ReactNativeFile } from "apollo-upload-client";
import { Picker } from '@react-native-picker/picker';
import { launchImageLibraryAsync } from 'expo-image-picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import { Text, Input, Button, Divider, Image, colors } from 'react-native-elements';
import { graphql, gql } from '@apollo/react-hoc';
import compose from "lodash.flowright";
import { addBookSchema } from '../utils/validationSchema';
import { formatYupErrors, formatServerErrors } from '../utils/formatError';

class EditBook extends React.PureComponent {
  state = {
    values: {
      id: this.props.route.params.book.id,
      title: this.props.route.params.book.title,
      authorId: this.props.route.params.book.authors.id,
      published_date: this.props.route.params.book.published_date,
      status: this.props.route.params.book.status,
      condition: this.props.route.params.book.condition,
      isbn: this.props.route.params.book.isbn,
      categoryId: this.props.route.params.book.categories.id,
      languageId: this.props.route.params.book.languages.id,
      price: this.props.route.params.book.price,
      description: this.props.route.params.book.description,
      coverFile: this.props.route.params.book.cover_url
    },
    errors: {},
    isSubmitting: false,
    loading: false
  }

  submit = async () => {
    if (this.state.isSubmitting) {
      return
    }

    // Validation
    try {
      await addBookSchema.validate(this.state.values, { abortEarly: false })
    } catch (err) {
      this.setState({ errors: formatYupErrors(err) })
    }

    const { values: { id, title, authorId, published_date, status, condition, isbn, categoryId, languageId, price, description, coverFile }, errors } = this.state

    let coverFileWraped
    if (typeof coverFile === 'object') {
      const tokens = coverFile.uri.split('/');
      const name = tokens[tokens.length - 1];

      coverFileWraped = new ReactNativeFile({
        uri: coverFile.uri,
        type: coverFile.type,
        name
      })
    } else if (typeof coverFile === 'string') {
      coverFileWraped = coverFile;
    }

    if (Object.keys(errors).length === 0) {
      this.setState({ isSubmitting: true })

      const { data: { updateBook: { book, errors } } } = await this.props.updateBookMutation({ variables: { bookId: id, title, authorId, published_date, status, condition, isbn: parseInt(isbn), categoryId, languageId, price: parseFloat(price), description, coverFile: coverFileWraped } })
      console.log("Resp data: ", book, errors)
      if (errors) {
        this.setState({ errors: formatServerErrors(errors) })
      } else {
        this.props.navigation.push('ViewBook', { name: 'View book', id: book.id })
      }

    }
  }

  onChangeText = (key, value) => {
    // Clone errors form state to local variable
    let errors = Object.assign({}, this.state.errors);
    delete errors[key];

    this.setState(state => ({
      values: {
        ...state.values,
        [key]: value
      },
      errors,
      isSubmitting: false
    }))
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  pickImage = async () => {
    let result = await launchImageLibraryAsync({ allowsEditing: true, aspect: [4, 3] });

    if (!result.cancelled) {
      // Clone errors form state to local variable
      let errors = Object.assign({}, this.state.errors);
      delete errors["coverFile"];

      this.setState({ values: { ...this.state.values, coverFile: result }, errors })
    }
  }

  render() {
    const { values: { title, authorId, published_date, status, condition, isbn, categoryId, languageId, price, description, coverFile }, loading, isSubmitting, errors } = this.state
    const { getAuthorsQuery: { getAuthors }, getCategoriesQuery: { getCategories }, getLanguagesQuery: { getLanguages } } = this.props

    if (loading) {
      return (
        <SafeAreaView style={styles.loadingContainer}>
          <ActivityIndicator size='large' />
        </SafeAreaView>
      );
    };

    return (
      <ScrollView>
        <View style={styles.container}>
          {/* Error message */}
          {errors.updateBook && <View style={{ backgroundColor: colors.error }}><Text color="white">{errors.updateBook}</Text></View>}

          <Input value={title} onChangeText={text => this.onChangeText('title', text)} placeholder="Title" errorStyle={{ color: colors.error }}
            errorMessage={errors.title} />
          <View style={styles.authorContainer}>
            <Text style={styles.authorTitle}>Select author or add a new one</Text>
            <Picker
              itemStyle={styles.picker}
              selectedValue={authorId}
              onValueChange={(itemValue, itemIndex) =>
                this.setState({ values: { ...this.state.values, authorId: itemValue } })
              }>
              {getAuthors && getAuthors.map(author =>
                <Picker.Item key={author.id} label={this.capitalizeFirstLetter(author.name)} value={author.id} />)}
            </Picker>
            {errors.authorId && <Text style={styles.cutomeTextError}>{errors.authorId}</Text>}
            <Button
              title='Add author'
              type='outline'
              icon={
                <Icon
                  name="plus-circle"
                  size={20}
                  style={{ marginRight: 10 }}
                  color={colors.primary}
                />
              }
              onPress={() => { this.props.navigation.navigate('AddAuthor', { screen: 'AddAuthor', params: { name: 'Add author', referrer: 'EditBook' } }) }}
            />
          </View>
          <View>
            <Text style={styles.pickerTitle}>Status</Text>
            <Picker
              itemStyle={styles.picker}
              selectedValue={status}
              onValueChange={(itemValue, itemIndex) =>
                this.setState({ values: { ...this.state.values, status: itemValue } })
              }>
              <Picker.Item label="Available" value="available" />
              <Picker.Item label="Ordered" value="ordered" />
              <Picker.Item label="Rented" value="rented" />
              <Picker.Item label="Sold" value="sold" />
            </Picker>
          </View>
          <View>
            <Text style={styles.pickerTitle}>Condition</Text>
            <Picker
              itemStyle={styles.picker}
              selectedValue={condition}
              onValueChange={(itemValue, itemIndex) =>
                this.setState({ values: { ...this.state.values, condition: itemValue } })
              }>
              <Picker.Item label="New" value="new" />
              <Picker.Item label="Used" value="used" />
              <Picker.Item label="Old" value="old" />
            </Picker>
          </View>
          <Input value={published_date} onChangeText={text => this.onChangeText('published_date', text)} placeholder="Published date ( Optional )" errorStyle={{ color: colors.error }}
            errorMessage={errors.published_date} />
          <Input value={isbn.toString()} onChangeText={text => this.onChangeText('isbn', text)} placeholder="ISBN" errorStyle={{ color: colors.error }}
            errorMessage={errors.isbn} />
          <View>
            <Text style={styles.pickerTitle}>Category</Text>
            <Picker
              itemStyle={styles.picker}
              selectedValue={categoryId}
              onValueChange={(itemValue, itemIndex) =>
                this.setState({ values: { ...this.state.values, categoryId: itemValue } })
              }>
              {getCategories && getCategories.map(category =>
                <Picker.Item key={category.id} label={this.capitalizeFirstLetter(category.name)} value={category.id} />)}
            </Picker>
            {errors.categoryId && <Text style={styles.cutomeTextError}>{errors.categoryId}</Text>}
          </View>
          <View>
            <Text style={styles.pickerTitle}>Language</Text>
            <Picker
              itemStyle={styles.picker}
              selectedValue={languageId}
              onValueChange={(itemValue, itemIndex) =>
                this.setState({ values: { ...this.state.values, languageId: itemValue } })
              }>
              {getLanguages && getLanguages.map(language =>
                <Picker.Item key={language.id} label={this.capitalizeFirstLetter(language.name)} value={language.id} />)}
            </Picker>
            {errors.languageId && <Text style={styles.cutomeTextError}>{errors.languageId}</Text>}
          </View>
          <Input value={price.toString()} onChangeText={text => this.onChangeText('price', text)} placeholder="price" errorStyle={{ color: colors.error }}
            errorMessage={errors.price} />
          <View style={{ flex: 1 }}>
            <Text style={styles.uploadPictureTitle}>Upload picture</Text>
            <Button
              type="outline"
              icon={
                <Icon
                  name="picture-o"
                  size={20}
                  style={{ marginRight: 10 }}
                  color={colors.primary}
                />
              }
              onPress={this.pickImage}
              title="Choose another image"
              style={{ alignSelf: 'center', marginBottom: 10 }}
            />
            {errors.coverFile && <Text style={styles.cutomeTextError}>{errors.coverFile}</Text>}
            {!!coverFile && <Image source={{ uri: coverFile.uri ? coverFile.uri : coverFile }} style={styles.image} PlaceholderContent={<ActivityIndicator />} />}
          </View>
          <TextInput
            style={styles.description}
            value={description}
            multiline={true}
            numberOfLines={4}
            onChangeText={text => this.onChangeText('description', text)} placeholder="Description" errorStyle={{ color: colors.error }} />

          <Divider style={{ marginTop: 20, marginBottom: 20 }} />

          <Button
            title="Edit"
            icon={
              <Icon
                name="pencil-square-o"
                size={20}
                style={{ marginRight: 10 }}
                color={colors.white}
              />
            }
            onPress={this.submit}
            disabled={isSubmitting}
          />
        </View>
      </ScrollView>
    )
  }
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: colors.white,
    paddingHorizontal: 10,
    paddingVertical: 20,
    marginVertical: 16,
    marginHorizontal: 16
  },
  authorContainer: {
    borderColor: colors.grey4,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 18,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1
  },
  authorTitle: {
    fontSize: 18,
    color: colors.grey3,
    marginHorizontal: 10,
    marginBottom: 18
  },
  pickerTitle: {
    fontSize: 18,
    color: colors.grey3,
    marginLeft: 10,
    marginRight: 10
  },
  uploadPictureTitle: {
    fontSize: 18,
    color: colors.grey3,
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 10
  },
  description: {
    fontSize: 18,
    color: colors.grey3,
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 20
  },
  picker: {
    marginTop: -40,
    height: 160,
    marginLeft: 10,
    marginRight: 10
  },
  image: {
    minWidth: 360,
    height: 200,
    marginBottom: 10
  },
  cutomeTextError: {
    color: colors.error,
    fontSize: 14,
    alignSelf: 'center',
    marginBottom: 10,
    marginTop: -5
  }
});

const UPDATE_BOOK_MUTATION = gql`
  mutation($bookId: Int!, $title: String!, $authorId: Int!, $published_date: String, $status: String!, $condition: String!, $isbn: Int, $categoryId: Int!, $languageId: Int!, $price: Float!, $coverFile: Upload, $description: String) {
    updateBook(bookId: $bookId, title: $title, authorId: $authorId, published_date: $published_date, status: $status, condition: $condition, isbn: $isbn, categoryId: $categoryId, languageId: $languageId, price: $price, coverFile: $coverFile, description: $description) {
      book {
        id
        title
      }
      errors {
        path
        message
      }
    }
  }
`;

const GET_AUTHORS_QUERY = gql`
  query {
    getAuthors {
      id
      name
    }
  }
`

const GET_LANGUAGES_QUERY = gql`
  query {
    getLanguages {
      id
      name
    }
  }
`

const GET_CATEGORIES_QUERY = gql`
  query {
    getCategories {
      id
      name
    }
  }
`

const MutationQueries = compose(
  graphql(UPDATE_BOOK_MUTATION, {
    name: "updateBookMutation"
  }),
  graphql(GET_CATEGORIES_QUERY, {
    name: "getCategoriesQuery"
  }),
  graphql(GET_LANGUAGES_QUERY, {
    name: "getLanguagesQuery"
  }),
  graphql(GET_AUTHORS_QUERY, {
    name: "getAuthorsQuery"
  })
)(EditBook);

export default MutationQueries;