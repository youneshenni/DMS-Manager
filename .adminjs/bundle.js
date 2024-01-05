(function (React, designSystem, adminjs) {
    'use strict';

    function _interopDefault (e) { return e && e.__esModule ? e : { default: e }; }

    var React__default = /*#__PURE__*/_interopDefault(React);

    const EditReference = props => {
      console.log("test reference");
      console.log(props);
      const {
        onChange,
        property,
        record
      } = props;
      const {
        reference: resourceId
      } = property;
      console.log(props);
      if (!resourceId) {
        throw new Error(`Cannot reference resource in property '${property.path}'`);
      }
      const handleChange = selected => {
        if (selected) {
          onChange(property.path, selected.value, selected.record);
        } else {
          onChange(property.path, null);
        }
      };
      var loadOptions = async inputValue => {
        const api = new adminjs.ApiClient();
        console.log(inputValue);
        console.log(resourceId);
        let optionRecords;
        if (record?.params?.[`${resourceId}Data`]) {
          optionRecords = record?.params?.[`${resourceId}Data`];
        } else {
          optionRecords = await api.searchRecords({
            resourceId,
            query: inputValue
          });
        }
        console.log(optionRecords);
        return optionRecords.map(optionRecord => ({
          value: optionRecord.id,
          label: optionRecord.title,
          record: optionRecord
        }));
      };
      const error = record?.errors[property.path];
      const selectedId = React.useMemo(() => adminjs.flat.get(record?.params, property.path), [record]);
      const [loadedRecord, setLoadedRecord] = React.useState();
      const [loadingRecord, setLoadingRecord] = React.useState(0);
      React.useEffect(() => {
        if (selectedId) {
          setLoadingRecord(c => c + 1);
          const api = new adminjs.ApiClient();
          api.recordAction({
            actionName: "show",
            resourceId,
            recordId: selectedId
          }).then(({
            data
          }) => {
            setLoadedRecord(data.record);
          }).finally(() => {
            setLoadingRecord(c => c - 1);
          });
        }
      }, [selectedId, resourceId]);
      const selectedValue = loadedRecord;
      const selectedOption = selectedId && selectedValue ? {
        value: selectedValue.id,
        label: selectedValue.title
      } : {
        value: "",
        label: ""
      };
      return /*#__PURE__*/React__default.default.createElement(designSystem.FormGroup, {
        error: Boolean(error)
      }, /*#__PURE__*/React__default.default.createElement(designSystem.Label, null, property.label), /*#__PURE__*/React__default.default.createElement(designSystem.SelectAsync, {
        cacheOptions: true,
        value: selectedOption,
        defaultOptions: true,
        loadOptions: loadOptions,
        onChange: handleChange,
        isClearable: true,
        isDisabled: property.isDisabled,
        isLoading: !!loadingRecord,
        ...property.props
      }), /*#__PURE__*/React__default.default.createElement(designSystem.FormMessage, null, error?.message ?? ""));
    };

    AdminJS.UserComponents = {};
    AdminJS.UserComponents.DefaultReferenceEditProperty = EditReference;

})(React, AdminJSDesignSystem, AdminJS);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVuZGxlLmpzIiwic291cmNlcyI6WyIuLi9kaXN0L2NvbXBvbmVudHMvcmVmZXJlbmNlLmpzIiwiLmVudHJ5LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZWFjdCwgeyB1c2VTdGF0ZSwgdXNlRWZmZWN0LCB1c2VNZW1vIH0gZnJvbSBcInJlYWN0XCI7XG5pbXBvcnQgeyBGb3JtR3JvdXAsIEZvcm1NZXNzYWdlLCBTZWxlY3RBc3luYywgTGFiZWwgfSBmcm9tIFwiQGFkbWluanMvZGVzaWduLXN5c3RlbVwiO1xuaW1wb3J0IHsgQXBpQ2xpZW50LCBmbGF0LCB9IGZyb20gXCJhZG1pbmpzXCI7XG5jb25zdCBFZGl0UmVmZXJlbmNlID0gKHByb3BzKSA9PiB7XG4gICAgY29uc29sZS5sb2coXCJ0ZXN0IHJlZmVyZW5jZVwiKTtcbiAgICBjb25zb2xlLmxvZyhwcm9wcyk7XG4gICAgY29uc3QgeyBvbkNoYW5nZSwgcHJvcGVydHksIHJlY29yZCB9ID0gcHJvcHM7XG4gICAgY29uc3QgeyByZWZlcmVuY2U6IHJlc291cmNlSWQgfSA9IHByb3BlcnR5O1xuICAgIGNvbnNvbGUubG9nKHByb3BzKTtcbiAgICBpZiAoIXJlc291cmNlSWQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW5ub3QgcmVmZXJlbmNlIHJlc291cmNlIGluIHByb3BlcnR5ICcke3Byb3BlcnR5LnBhdGh9J2ApO1xuICAgIH1cbiAgICBjb25zdCBoYW5kbGVDaGFuZ2UgPSAoc2VsZWN0ZWQpID0+IHtcbiAgICAgICAgaWYgKHNlbGVjdGVkKSB7XG4gICAgICAgICAgICBvbkNoYW5nZShwcm9wZXJ0eS5wYXRoLCBzZWxlY3RlZC52YWx1ZSwgc2VsZWN0ZWQucmVjb3JkKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIG9uQ2hhbmdlKHByb3BlcnR5LnBhdGgsIG51bGwpO1xuICAgICAgICB9XG4gICAgfTtcbiAgICB2YXIgbG9hZE9wdGlvbnMgPSBhc3luYyAoaW5wdXRWYWx1ZSkgPT4ge1xuICAgICAgICBjb25zdCBhcGkgPSBuZXcgQXBpQ2xpZW50KCk7XG4gICAgICAgIGNvbnNvbGUubG9nKGlucHV0VmFsdWUpO1xuICAgICAgICBjb25zb2xlLmxvZyhyZXNvdXJjZUlkKTtcbiAgICAgICAgbGV0IG9wdGlvblJlY29yZHM7XG4gICAgICAgIGlmIChyZWNvcmQ/LnBhcmFtcz8uW2Ake3Jlc291cmNlSWR9RGF0YWBdKSB7XG4gICAgICAgICAgICBvcHRpb25SZWNvcmRzID0gcmVjb3JkPy5wYXJhbXM/LltgJHtyZXNvdXJjZUlkfURhdGFgXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIG9wdGlvblJlY29yZHMgPSBhd2FpdCBhcGkuc2VhcmNoUmVjb3Jkcyh7XG4gICAgICAgICAgICAgICAgcmVzb3VyY2VJZCxcbiAgICAgICAgICAgICAgICBxdWVyeTogaW5wdXRWYWx1ZSxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKG9wdGlvblJlY29yZHMpO1xuICAgICAgICByZXR1cm4gb3B0aW9uUmVjb3Jkcy5tYXAoKG9wdGlvblJlY29yZCkgPT4gKHtcbiAgICAgICAgICAgIHZhbHVlOiBvcHRpb25SZWNvcmQuaWQsXG4gICAgICAgICAgICBsYWJlbDogb3B0aW9uUmVjb3JkLnRpdGxlLFxuICAgICAgICAgICAgcmVjb3JkOiBvcHRpb25SZWNvcmQsXG4gICAgICAgIH0pKTtcbiAgICB9O1xuICAgIGNvbnN0IGVycm9yID0gcmVjb3JkPy5lcnJvcnNbcHJvcGVydHkucGF0aF07XG4gICAgY29uc3Qgc2VsZWN0ZWRJZCA9IHVzZU1lbW8oKCkgPT4gZmxhdC5nZXQocmVjb3JkPy5wYXJhbXMsIHByb3BlcnR5LnBhdGgpLCBbcmVjb3JkXSk7XG4gICAgY29uc3QgW2xvYWRlZFJlY29yZCwgc2V0TG9hZGVkUmVjb3JkXSA9IHVzZVN0YXRlKCk7XG4gICAgY29uc3QgW2xvYWRpbmdSZWNvcmQsIHNldExvYWRpbmdSZWNvcmRdID0gdXNlU3RhdGUoMCk7XG4gICAgdXNlRWZmZWN0KCgpID0+IHtcbiAgICAgICAgaWYgKHNlbGVjdGVkSWQpIHtcbiAgICAgICAgICAgIHNldExvYWRpbmdSZWNvcmQoKGMpID0+IGMgKyAxKTtcbiAgICAgICAgICAgIGNvbnN0IGFwaSA9IG5ldyBBcGlDbGllbnQoKTtcbiAgICAgICAgICAgIGFwaVxuICAgICAgICAgICAgICAgIC5yZWNvcmRBY3Rpb24oe1xuICAgICAgICAgICAgICAgIGFjdGlvbk5hbWU6IFwic2hvd1wiLFxuICAgICAgICAgICAgICAgIHJlc291cmNlSWQsXG4gICAgICAgICAgICAgICAgcmVjb3JkSWQ6IHNlbGVjdGVkSWQsXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC50aGVuKCh7IGRhdGEgfSkgPT4ge1xuICAgICAgICAgICAgICAgIHNldExvYWRlZFJlY29yZChkYXRhLnJlY29yZCk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5maW5hbGx5KCgpID0+IHtcbiAgICAgICAgICAgICAgICBzZXRMb2FkaW5nUmVjb3JkKChjKSA9PiBjIC0gMSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0sIFtzZWxlY3RlZElkLCByZXNvdXJjZUlkXSk7XG4gICAgY29uc3Qgc2VsZWN0ZWRWYWx1ZSA9IGxvYWRlZFJlY29yZDtcbiAgICBjb25zdCBzZWxlY3RlZE9wdGlvbiA9IHNlbGVjdGVkSWQgJiYgc2VsZWN0ZWRWYWx1ZVxuICAgICAgICA/IHtcbiAgICAgICAgICAgIHZhbHVlOiBzZWxlY3RlZFZhbHVlLmlkLFxuICAgICAgICAgICAgbGFiZWw6IHNlbGVjdGVkVmFsdWUudGl0bGUsXG4gICAgICAgIH1cbiAgICAgICAgOiB7XG4gICAgICAgICAgICB2YWx1ZTogXCJcIixcbiAgICAgICAgICAgIGxhYmVsOiBcIlwiLFxuICAgICAgICB9O1xuICAgIHJldHVybiAoUmVhY3QuY3JlYXRlRWxlbWVudChGb3JtR3JvdXAsIHsgZXJyb3I6IEJvb2xlYW4oZXJyb3IpIH0sXG4gICAgICAgIFJlYWN0LmNyZWF0ZUVsZW1lbnQoTGFiZWwsIG51bGwsIHByb3BlcnR5LmxhYmVsKSxcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChTZWxlY3RBc3luYywgeyBjYWNoZU9wdGlvbnM6IHRydWUsIHZhbHVlOiBzZWxlY3RlZE9wdGlvbiwgZGVmYXVsdE9wdGlvbnM6IHRydWUsIGxvYWRPcHRpb25zOiBsb2FkT3B0aW9ucywgb25DaGFuZ2U6IGhhbmRsZUNoYW5nZSwgaXNDbGVhcmFibGU6IHRydWUsIGlzRGlzYWJsZWQ6IHByb3BlcnR5LmlzRGlzYWJsZWQsIGlzTG9hZGluZzogISFsb2FkaW5nUmVjb3JkLCAuLi5wcm9wZXJ0eS5wcm9wcyB9KSxcbiAgICAgICAgUmVhY3QuY3JlYXRlRWxlbWVudChGb3JtTWVzc2FnZSwgbnVsbCwgZXJyb3I/Lm1lc3NhZ2UgPz8gXCJcIikpKTtcbn07XG5leHBvcnQgZGVmYXVsdCBFZGl0UmVmZXJlbmNlO1xuIiwiQWRtaW5KUy5Vc2VyQ29tcG9uZW50cyA9IHt9XG5pbXBvcnQgRGVmYXVsdFJlZmVyZW5jZUVkaXRQcm9wZXJ0eSBmcm9tICcuLi9kaXN0L2NvbXBvbmVudHMvcmVmZXJlbmNlJ1xuQWRtaW5KUy5Vc2VyQ29tcG9uZW50cy5EZWZhdWx0UmVmZXJlbmNlRWRpdFByb3BlcnR5ID0gRGVmYXVsdFJlZmVyZW5jZUVkaXRQcm9wZXJ0eSJdLCJuYW1lcyI6WyJFZGl0UmVmZXJlbmNlIiwicHJvcHMiLCJjb25zb2xlIiwibG9nIiwib25DaGFuZ2UiLCJwcm9wZXJ0eSIsInJlY29yZCIsInJlZmVyZW5jZSIsInJlc291cmNlSWQiLCJFcnJvciIsInBhdGgiLCJoYW5kbGVDaGFuZ2UiLCJzZWxlY3RlZCIsInZhbHVlIiwibG9hZE9wdGlvbnMiLCJpbnB1dFZhbHVlIiwiYXBpIiwiQXBpQ2xpZW50Iiwib3B0aW9uUmVjb3JkcyIsInBhcmFtcyIsInNlYXJjaFJlY29yZHMiLCJxdWVyeSIsIm1hcCIsIm9wdGlvblJlY29yZCIsImlkIiwibGFiZWwiLCJ0aXRsZSIsImVycm9yIiwiZXJyb3JzIiwic2VsZWN0ZWRJZCIsInVzZU1lbW8iLCJmbGF0IiwiZ2V0IiwibG9hZGVkUmVjb3JkIiwic2V0TG9hZGVkUmVjb3JkIiwidXNlU3RhdGUiLCJsb2FkaW5nUmVjb3JkIiwic2V0TG9hZGluZ1JlY29yZCIsInVzZUVmZmVjdCIsImMiLCJyZWNvcmRBY3Rpb24iLCJhY3Rpb25OYW1lIiwicmVjb3JkSWQiLCJ0aGVuIiwiZGF0YSIsImZpbmFsbHkiLCJzZWxlY3RlZFZhbHVlIiwic2VsZWN0ZWRPcHRpb24iLCJSZWFjdCIsImNyZWF0ZUVsZW1lbnQiLCJGb3JtR3JvdXAiLCJCb29sZWFuIiwiTGFiZWwiLCJTZWxlY3RBc3luYyIsImNhY2hlT3B0aW9ucyIsImRlZmF1bHRPcHRpb25zIiwiaXNDbGVhcmFibGUiLCJpc0Rpc2FibGVkIiwiaXNMb2FkaW5nIiwiRm9ybU1lc3NhZ2UiLCJtZXNzYWdlIiwiQWRtaW5KUyIsIlVzZXJDb21wb25lbnRzIiwiRGVmYXVsdFJlZmVyZW5jZUVkaXRQcm9wZXJ0eSJdLCJtYXBwaW5ncyI6Ijs7Ozs7OztJQUdBLE1BQU1BLGFBQWEsR0FBSUMsS0FBSyxJQUFLO0lBQzdCQyxFQUFBQSxPQUFPLENBQUNDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBO0lBQzdCRCxFQUFBQSxPQUFPLENBQUNDLEdBQUcsQ0FBQ0YsS0FBSyxDQUFDLENBQUE7TUFDbEIsTUFBTTtRQUFFRyxRQUFRO1FBQUVDLFFBQVE7SUFBRUMsSUFBQUEsTUFBQUE7SUFBTyxHQUFDLEdBQUdMLEtBQUssQ0FBQTtNQUM1QyxNQUFNO0lBQUVNLElBQUFBLFNBQVMsRUFBRUMsVUFBQUE7SUFBVyxHQUFDLEdBQUdILFFBQVEsQ0FBQTtJQUMxQ0gsRUFBQUEsT0FBTyxDQUFDQyxHQUFHLENBQUNGLEtBQUssQ0FBQyxDQUFBO01BQ2xCLElBQUksQ0FBQ08sVUFBVSxFQUFFO1FBQ2IsTUFB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
